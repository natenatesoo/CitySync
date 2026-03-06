// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { MCECredit } from "../token/MCECredit.sol";
import { VoteToken } from "../../citysync/token/VoteToken.sol";
import { MCERegistry } from "./MCERegistry.sol";
import { IssuerRegistry } from "../identity/IssuerRegistry.sol";

/// @notice MCETaskRegistry — manages tasks tied to a specific MCE.
///
/// Task lifecycle:
///   Issuers create tasks during the MCE's Planning phase.
///   Participants claim → submit completion → backend oracle verifies (EIP712 sig).
///   Verification mints MCECredit (and optionally VoteToken) to the participant.
///
/// Demo auto-verification:
///   The frontend shows a 10–15 second "Task is being Verified..." spinner.
///   After the delay, the backend oracle signs a VerifyCompletion EIP712 message
///   and calls verifyCompletionWithSig(). No Issuer action needed for the demo.
///
/// Tasks can only be created while the MCE is in Planning status,
/// and only claimed/completed while the MCE is Active.
contract MCETaskRegistry is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    MCECredit public immutable MCE_CREDIT;
    VoteToken public immutable VOTE;
    MCERegistry public immutable MCE_REG;
    IssuerRegistry public immutable ISSUER_REG;

    struct MCETask {
        uint256 mceId;
        address issuer;
        string metadataURI;     // IPFS: title, description, instructions, image
        uint256 rewardMCE;      // MCECredit minted on completion
        uint256 rewardVote;     // VoteToken minted (0 = same as rewardMCE)
        uint256 maxCompletions; // 0 = unlimited
        uint32 verifiedCount;
        bool active;
    }

    enum CompletionStatus { None, Submitted, Verified, Invalidated }

    struct Completion {
        bytes32 proofHash;
        uint64 submittedAt;
        uint64 verifiedAt;
        CompletionStatus status;
    }

    mapping(uint256 => MCETask) public tasks;
    uint256 public nextTaskId = 1;

    mapping(uint256 taskId => address claimant) public claimedBy;
    mapping(uint256 taskId => mapping(address citizen => Completion)) public completions;

    /// @dev EIP712 nonce per (citizen, taskId) for replay protection.
    mapping(uint256 taskId => mapping(address citizen => uint256)) public verifyNonces;

    bytes32 public constant VERIFY_TYPEHASH = keccak256(
        "VerifyMCECompletion(address citizen,uint256 taskId,bytes32 proofHash,uint256 nonce,uint256 deadline)"
    );

    event MCETaskCreated(
        uint256 indexed taskId,
        uint256 indexed mceId,
        address indexed issuer,
        uint256 rewardMCE,
        string metadataURI
    );
    event MCETaskClaimed(uint256 indexed taskId, address indexed citizen);
    event MCECompletionSubmitted(uint256 indexed taskId, address indexed citizen, bytes32 proofHash);
    event MCECompletionVerified(
        uint256 indexed taskId,
        uint256 indexed mceId,
        address indexed citizen,
        uint256 mceMinted,
        uint256 voteMinted
    );
    event MCECompletionInvalidated(uint256 indexed taskId, address indexed citizen, string reason);

    error NotIssuer();
    error MCENotInPlanning();
    error MCENotActive();
    error TaskInactive();
    error MaxCompletionsReached();
    error AlreadyClaimed();
    error NotSubmitted();
    error BadTask();
    error SigExpired();
    error BadSigner();

    constructor(
        address admin,
        MCECredit mceCredit,
        VoteToken vote,
        MCERegistry mceReg,
        IssuerRegistry issuerReg
    ) EIP712("CitySyncMCETaskRegistry", "1") {
        MCE_CREDIT = mceCredit;
        VOTE = vote;
        MCE_REG = mceReg;
        ISSUER_REG = issuerReg;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ---------- Task creation (Planning phase) ----------

    function createTask(
        uint256 mceId,
        string calldata metadataURI,
        uint256 rewardMCE,
        uint256 rewardVote,
        uint256 maxCompletions
    ) external whenNotPaused returns (uint256 taskId) {
        if (!ISSUER_REG.isActiveIssuer(msg.sender)) revert NotIssuer();
        require(rewardMCE > 0, "rewardMCE=0");

        // Tasks may only be created during Planning
        MCERegistry.MCEStatus status = MCE_REG.getStatus(mceId);
        if (status != MCERegistry.MCEStatus.Planning) revert MCENotInPlanning();

        taskId = nextTaskId++;
        tasks[taskId] = MCETask({
            mceId: mceId,
            issuer: msg.sender,
            metadataURI: metadataURI,
            rewardMCE: rewardMCE,
            rewardVote: rewardVote,
            maxCompletions: maxCompletions,
            verifiedCount: 0,
            active: true
        });

        emit MCETaskCreated(taskId, mceId, msg.sender, rewardMCE, metadataURI);
    }

    // ---------- Claim ----------

    function claimTask(uint256 taskId) external whenNotPaused {
        MCETask storage t = tasks[taskId];
        if (t.issuer == address(0)) revert BadTask();
        if (!t.active) revert TaskInactive();
        _requireMCEActive(t.mceId);
        if (t.maxCompletions != 0 && t.verifiedCount >= t.maxCompletions) revert MaxCompletionsReached();

        address current = claimedBy[taskId];
        if (current != address(0) && current != msg.sender) revert AlreadyClaimed();

        claimedBy[taskId] = msg.sender;
        emit MCETaskClaimed(taskId, msg.sender);
    }

    // ---------- Submit completion ----------

    function submitCompletion(uint256 taskId, bytes32 proofHash) external whenNotPaused {
        MCETask storage t = tasks[taskId];
        if (t.issuer == address(0)) revert BadTask();
        if (!t.active) revert TaskInactive();
        _requireMCEActive(t.mceId);

        address claimant = claimedBy[taskId];
        require(claimant == address(0) || claimant == msg.sender, "claimed by other");

        Completion storage c = completions[taskId][msg.sender];
        require(
            c.status == CompletionStatus.None || c.status == CompletionStatus.Invalidated,
            "already pending/verified"
        );

        c.proofHash = proofHash;
        c.submittedAt = uint64(block.timestamp);
        c.verifiedAt = 0;
        c.status = CompletionStatus.Submitted;

        emit MCECompletionSubmitted(taskId, msg.sender, proofHash);
    }

    // ---------- EIP712 oracle verification (demo auto-verify path) ----------

    /// @notice Backend oracle calls this after the frontend's simulated verification delay.
    /// The oracle wallet signs a VerifyMCECompletion struct and submits on-chain.
    /// This mints MCECredit + VoteToken to the participant.
    function verifyCompletionWithSig(
        uint256 taskId,
        address citizen,
        bytes32 proofHash,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        MCETask storage t = tasks[taskId];
        if (t.issuer == address(0)) revert BadTask();
        if (!t.active) revert TaskInactive();
        if (t.maxCompletions != 0 && t.verifiedCount >= t.maxCompletions) revert MaxCompletionsReached();
        if (block.timestamp > deadline) revert SigExpired();

        Completion storage c = completions[taskId][citizen];
        if (c.status != CompletionStatus.Submitted) revert NotSubmitted();
        require(c.proofHash == proofHash, "proof mismatch");

        // Verify EIP712 signature — must be signed by the task's issuer or CITY_ADMIN
        uint256 nonce = verifyNonces[taskId][citizen]++;
        bytes32 structHash =
            keccak256(abi.encode(VERIFY_TYPEHASH, citizen, taskId, proofHash, nonce, deadline));
        address signer = _hashTypedDataV4(structHash).recover(signature);

        bool authorized = (signer == t.issuer) || hasRole(CITY_ADMIN_ROLE, signer);
        if (!authorized) revert BadSigner();

        _finalizeVerification(taskId, citizen, t, c);
    }

    // ---------- Invalidation ----------

    function invalidateCompletion(uint256 taskId, address citizen, string calldata reason)
        external
        onlyRole(CITY_ADMIN_ROLE)
    {
        Completion storage c = completions[taskId][citizen];
        require(c.status == CompletionStatus.Submitted, "not submitted");
        c.status = CompletionStatus.Invalidated;
        emit MCECompletionInvalidated(taskId, citizen, reason);
    }

    // ---------- Admin task management ----------

    function setTaskActive(uint256 taskId, bool active) external onlyRole(CITY_ADMIN_ROLE) {
        MCETask storage t = tasks[taskId];
        if (t.issuer == address(0)) revert BadTask();
        t.active = active;
    }

    // ---------- Internal ----------

    function _requireMCEActive(uint256 mceId) internal view {
        MCERegistry.MCEStatus status = MCE_REG.getStatus(mceId);
        if (status != MCERegistry.MCEStatus.Active) revert MCENotActive();
    }

    function _finalizeVerification(
        uint256 taskId,
        address citizen,
        MCETask storage t,
        Completion storage c
    ) internal {
        c.status = CompletionStatus.Verified;
        c.verifiedAt = uint64(block.timestamp);
        t.verifiedCount += 1;

        uint256 mceAmt = t.rewardMCE;
        uint256 voteAmt = t.rewardVote == 0 ? t.rewardMCE : t.rewardVote;

        MCE_CREDIT.mintTo(citizen, mceAmt, t.mceId);
        VOTE.mintTo(citizen, voteAmt);

        // Update issuer stats
        try ISSUER_REG.recordIssuance(t.issuer, mceAmt) {} catch {}

        emit MCECompletionVerified(taskId, t.mceId, citizen, mceAmt, voteAmt);
    }

    // ---------- Views ----------

    function getTask(uint256 taskId) external view returns (MCETask memory) {
        return tasks[taskId];
    }

    function getCompletion(uint256 taskId, address citizen) external view returns (Completion memory) {
        return completions[taskId][citizen];
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
