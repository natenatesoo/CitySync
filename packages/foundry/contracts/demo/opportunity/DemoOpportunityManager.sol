// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { EIP712 } from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import { CityToken } from "../../citysync/token/CityToken.sol";
import { VoteToken } from "../../citysync/token/VoteToken.sol";
import { IEligibility } from "../../citysync/interfaces/IEligibility.sol";
import { IssuerRegistry } from "../identity/IssuerRegistry.sol";

/// @notice Demo-focused OpportunityManager:
/// issuer creation is permissionless via IssuerRegistry self-registration.
/// An issuer can create opportunities when IssuerRegistry marks them active.
contract DemoOpportunityManager is AccessControl, Pausable, ReentrancyGuard, EIP712 {
    using ECDSA for bytes32;

    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");
    bytes32 public constant CERTIFIED_ISSUER_ROLE = keccak256("CERTIFIED_ISSUER_ROLE");
    bytes32 public constant GUARDIAN_ROLE = keccak256("GUARDIAN_ROLE");

    /// @dev Issuer-specific delegated verifier mapping.
    mapping(address issuer => mapping(address verifier => bool)) public isVerifierForIssuer;

    CityToken public immutable CITY;
    VoteToken public immutable VOTE;
    IssuerRegistry public immutable ISSUER_REG;

    enum VerificationMode {
        IssuerOnly,
        DelegatedVerifiers,
        EIP712Signature
    }

    struct Opportunity {
        address issuer;
        string metadataURI;
        uint256 rewardCity;
        uint256 rewardVote; // default to rewardCity if set to 0
        address eligibilityHook; // optional
        VerificationMode mode;
        uint256 maxCompletions; // 0 = unlimited
        uint64 expiresAt; // 0 = never
        uint64 cooldownSeconds; // 0 = none
        bool active;
        uint32 verifiedCount;
    }

    enum CompletionStatus {
        None,
        Submitted,
        Verified,
        Invalidated
    }

    struct Completion {
        bytes32 proofHash;
        uint64 submittedAt;
        uint64 verifiedAt;
        CompletionStatus status;
    }

    mapping(uint256 => Opportunity) public opportunities;
    uint256 public nextOpportunityId = 1;

    /// @dev Exclusive claim per opportunity (optional). If set, only claimedBy can submit completion.
    mapping(uint256 => address) public claimedBy;

    mapping(uint256 => mapping(address => Completion)) public completions;
    mapping(uint256 => mapping(address => uint64)) public lastVerifiedAt;

    /// @dev EIP712 signature-based verification: nonce per (citizen, opportunity)
    mapping(uint256 => mapping(address => uint256)) public verifyNonces;

    /// @dev verifier signs: citizen, opportunityId, proofHash, nonce, deadline
    bytes32 public constant VERIFY_TYPEHASH = keccak256(
        "VerifyCompletion(address citizen,uint256 opportunityId,bytes32 proofHash,uint256 nonce,uint256 deadline)"
    );

    event IssuerApproved(address indexed issuer, bool approved);
    event VerifierSet(address indexed issuer, address indexed verifier, bool approved);

    event OpportunityCreated(
        uint256 indexed opportunityId,
        address indexed issuer,
        uint256 rewardCity,
        uint256 rewardVote,
        VerificationMode mode,
        string metadataURI
    );

    event OpportunityUpdated(uint256 indexed opportunityId);
    event OpportunityStatusSet(uint256 indexed opportunityId, bool active);

    event OpportunityClaimed(uint256 indexed opportunityId, address indexed citizen);
    event OpportunityUnclaimed(uint256 indexed opportunityId, address indexed citizen);

    event CompletionSubmitted(uint256 indexed opportunityId, address indexed citizen, bytes32 proofHash);
    event CompletionVerified(
        uint256 indexed opportunityId, address indexed citizen, uint256 cityMinted, uint256 voteMinted
    );
    event CompletionInvalidated(uint256 indexed opportunityId, address indexed citizen, string reason);

    constructor(address admin, CityToken city, VoteToken vote, IssuerRegistry issuerRegistry)
        EIP712("CitySyncOpportunityManager", "1")
    {
        CITY = city;
        VOTE = vote;
        ISSUER_REG = issuerRegistry;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ---------- Admin / issuer management ----------

    /// @notice Kept for ABI compatibility with pilot manager.
    /// In demo mode, issuer auth comes from IssuerRegistry.isActiveIssuer.
    function setIssuerApproved(address issuer, bool approved) external onlyRole(CITY_ADMIN_ROLE) {
        if (approved) _grantRole(CERTIFIED_ISSUER_ROLE, issuer);
        else _revokeRole(CERTIFIED_ISSUER_ROLE, issuer);
        emit IssuerApproved(issuer, approved);
    }

    function setVerifierForIssuer(address issuer, address verifier, bool approved) external {
        // issuer or city admin can manage verifiers
        if (msg.sender != issuer) {
            _checkRole(CITY_ADMIN_ROLE, msg.sender);
        }
        isVerifierForIssuer[issuer][verifier] = approved;
        emit VerifierSet(issuer, verifier, approved);
    }

    // ---------- Opportunity lifecycle ----------

    function createOpportunity(
        string calldata metadataURI,
        uint256 rewardCity,
        uint256 rewardVote, // 0 => 1:1 w/ CITY
        address eligibilityHook,
        VerificationMode mode,
        uint256 maxCompletions,
        uint64 expiresAt,
        uint64 cooldownSeconds
    ) external returns (uint256 opportunityId) {
        require(ISSUER_REG.isActiveIssuer(msg.sender), "issuer not active");
        require(rewardCity > 0, "rewardCity=0");
        opportunityId = nextOpportunityId++;

        Opportunity storage o = opportunities[opportunityId];
        o.issuer = msg.sender;
        o.metadataURI = metadataURI;
        o.rewardCity = rewardCity;
        o.rewardVote = rewardVote;
        o.eligibilityHook = eligibilityHook;
        o.mode = mode;
        o.maxCompletions = maxCompletions;
        o.expiresAt = expiresAt;
        o.cooldownSeconds = cooldownSeconds;
        o.active = true;

        emit OpportunityCreated(
            opportunityId, msg.sender, rewardCity, rewardVote == 0 ? rewardCity : rewardVote, mode, metadataURI
        );
    }

    /// @notice Update mutable fields; cannot change issuer; cannot reduce maxCompletions below already verifiedCount.
    function updateOpportunity(
        uint256 opportunityId,
        string calldata metadataURI,
        uint256 newRewardCity,
        uint256 newRewardVote,
        address newEligibilityHook,
        uint256 newMaxCompletions,
        uint64 newExpiresAt,
        uint64 newCooldownSeconds
    ) external {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(msg.sender == o.issuer || hasRole(CITY_ADMIN_ROLE, msg.sender), "not allowed");

        if (newMaxCompletions != 0) {
            require(newMaxCompletions >= o.verifiedCount, "max<verified");
        }

        if (newRewardCity != 0) o.rewardCity = newRewardCity;
        o.rewardVote = newRewardVote;
        o.metadataURI = metadataURI;
        o.eligibilityHook = newEligibilityHook;
        o.maxCompletions = newMaxCompletions;
        o.expiresAt = newExpiresAt;
        o.cooldownSeconds = newCooldownSeconds;

        emit OpportunityUpdated(opportunityId);
    }

    function setOpportunityActive(uint256 opportunityId, bool active) external {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(msg.sender == o.issuer || hasRole(CITY_ADMIN_ROLE, msg.sender), "not allowed");
        o.active = active;
        emit OpportunityStatusSet(opportunityId, active);
    }

    // ---------- Claim lifecycle ----------

    /// @notice Claim an opportunity. Once claimed, only the claimant can submit completion.
    function claimOpportunity(uint256 opportunityId) external whenNotPaused {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(o.active, "inactive");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");

        address current = claimedBy[opportunityId];
        require(current == address(0) || current == msg.sender, "already claimed");

        claimedBy[opportunityId] = msg.sender;
        emit OpportunityClaimed(opportunityId, msg.sender);
    }

    /// @notice Unclaim an opportunity (only by current claimant). Requires no pending completion.
    function unclaimOpportunity(uint256 opportunityId) external whenNotPaused {
        require(claimedBy[opportunityId] == msg.sender, "not claimant");

        Completion storage c = completions[opportunityId][msg.sender];
        require(c.status == CompletionStatus.None || c.status == CompletionStatus.Invalidated, "pending/verified");

        claimedBy[opportunityId] = address(0);
        emit OpportunityUnclaimed(opportunityId, msg.sender);
    }

    // ---------- Completion lifecycle ----------

    function submitCompletion(uint256 opportunityId, bytes32 proofHash) external whenNotPaused {
        Opportunity storage o = opportunities[opportunityId];
        require(o.active, "inactive");
        require(o.issuer != address(0), "bad id");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");

        if (o.eligibilityHook != address(0)) {
            require(IEligibility(o.eligibilityHook).isEligible(msg.sender, opportunityId), "ineligible");
        }

        address claimant = claimedBy[opportunityId];
        require(claimant == address(0) || claimant == msg.sender, "claimed by other");

        Completion storage c = completions[opportunityId][msg.sender];
        require(
            c.status == CompletionStatus.None || c.status == CompletionStatus.Invalidated, "already pending/verified"
        );

        if (o.cooldownSeconds != 0) {
            uint64 last = lastVerifiedAt[opportunityId][msg.sender];
            require(last == 0 || block.timestamp >= uint256(last) + uint256(o.cooldownSeconds), "cooldown");
        }

        c.proofHash = proofHash;
        c.submittedAt = uint64(block.timestamp);
        c.verifiedAt = 0;
        c.status = CompletionStatus.Submitted;

        emit CompletionSubmitted(opportunityId, msg.sender, proofHash);
    }

    /// @notice Onchain verifier path (IssuerOnly / DelegatedVerifiers).
    function verifyCompletion(uint256 opportunityId, address citizen) external whenNotPaused nonReentrant {
        Opportunity storage o = opportunities[opportunityId];
        require(o.active, "inactive");
        require(o.issuer != address(0), "bad id");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");
        if (o.maxCompletions != 0) require(o.verifiedCount < o.maxCompletions, "max reached");

        _requireCanVerify(o, msg.sender);

        Completion storage c = completions[opportunityId][citizen];
        require(c.status == CompletionStatus.Submitted, "not submitted");

        _finalizeVerification(opportunityId, citizen, o, c);
    }

    /// @notice Signature-based verifier path (EIP-712).
    function verifyCompletionWithSig(
        uint256 opportunityId,
        address citizen,
        bytes32 proofHash,
        uint256 deadline,
        bytes calldata signature
    ) external whenNotPaused nonReentrant {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");
        require(o.mode == VerificationMode.EIP712Signature, "wrong mode");
        require(o.active, "inactive");
        if (o.expiresAt != 0) require(block.timestamp <= o.expiresAt, "expired");
        if (o.maxCompletions != 0) require(o.verifiedCount < o.maxCompletions, "max reached");
        require(block.timestamp <= deadline, "sig expired");

        Completion storage c = completions[opportunityId][citizen];
        require(c.status == CompletionStatus.Submitted, "not submitted");
        require(c.proofHash == proofHash, "proof mismatch");

        uint256 nonce = verifyNonces[opportunityId][citizen]++;

        bytes32 structHash = keccak256(abi.encode(VERIFY_TYPEHASH, citizen, opportunityId, proofHash, nonce, deadline));
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);

        require(signer == o.issuer || isVerifierForIssuer[o.issuer][signer], "bad signer");

        _finalizeVerification(opportunityId, citizen, o, c);
    }

    /// @notice Invalidate a completion submission (pre-mint only).
    function invalidateCompletion(uint256 opportunityId, address citizen, string calldata reason)
        external
        whenNotPaused
    {
        Opportunity storage o = opportunities[opportunityId];
        require(o.issuer != address(0), "bad id");

        require(
            msg.sender == o.issuer || hasRole(CITY_ADMIN_ROLE, msg.sender) || hasRole(GUARDIAN_ROLE, msg.sender),
            "not allowed"
        );

        Completion storage c = completions[opportunityId][citizen];
        require(c.status == CompletionStatus.Submitted, "not submitted");
        c.status = CompletionStatus.Invalidated;

        emit CompletionInvalidated(opportunityId, citizen, reason);
    }

    // ---------- Internal ----------

    function _requireCanVerify(Opportunity storage o, address verifier) internal view {
        if (o.mode == VerificationMode.IssuerOnly) {
            require(verifier == o.issuer, "issuer only");
        } else if (o.mode == VerificationMode.DelegatedVerifiers) {
            require(verifier == o.issuer || isVerifierForIssuer[o.issuer][verifier], "not verifier");
        } else {
            revert("use sig mode");
        }
    }

    function _finalizeVerification(uint256 opportunityId, address citizen, Opportunity storage o, Completion storage c)
        internal
    {
        c.status = CompletionStatus.Verified;
        c.verifiedAt = uint64(block.timestamp);

        o.verifiedCount += 1;
        lastVerifiedAt[opportunityId][citizen] = uint64(block.timestamp);

        uint256 cityAmt = o.rewardCity;
        uint256 voteAmt = o.rewardVote == 0 ? o.rewardCity : o.rewardVote;

        CITY.mintTo(citizen, cityAmt);
        VOTE.mintTo(citizen, voteAmt);

        emit CompletionVerified(opportunityId, citizen, cityAmt, voteAmt);
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(CITY_ADMIN_ROLE) {
        _unpause();
    }
}
