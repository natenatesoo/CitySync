// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { VoteToken } from "../../citysync/token/VoteToken.sol";
import { IssuerRegistry } from "../identity/IssuerRegistry.sol";

/// @notice MCERegistry — full Mass Coordination Event lifecycle.
///
/// State machine:
///   Proposed → (voting period ends) → Planning (passed) | Rejected (failed)
///   Planning → (planning period ends) → Active
///   Active → (admin closes or duration passes) → Closed
///
/// Timeline (demo defaults, configurable per deployment):
///   Voting:   14 days  (1_209_600 seconds) — same as pilot so the demo feels real
///   Planning:  2 days  (172_800 seconds)
///   Active:   open-ended until admin closes
///
/// Voting uses current VoteToken balance (not snapshot) — acceptable for demo scale.
/// Any CERTIFIED_ISSUER may propose. Any VoteToken holder may vote once per MCE.
/// Quorum is configurable (default: 10 VoteTokens) to allow realistic demo voting.
contract MCERegistry is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    // --- Configurable timings ---
    uint64 public votingDuration = 14 days;
    uint64 public planningDuration = 2 days;

    /// @notice Minimum total votes (for + against) needed for a result to be valid.
    uint256 public quorum = 10 ether; // 10 VoteTokens (18 decimals)

    VoteToken public immutable VOTE;
    IssuerRegistry public immutable ISSUER_REG;

    enum MCEStatus {
        Proposed,   // voting open
        Planning,   // passed vote, Issuers may submit planning tasks
        Active,     // MCE tasks live, Participants can complete them
        Closed,     // no more completions
        Rejected    // failed quorum or majority
    }

    struct MCE {
        uint256 id;
        string title;
        string description;
        string cityContext;     // what problem this solves in the city
        address proposer;
        uint64 proposedAt;
        uint64 votingEndsAt;
        uint64 planningEndsAt;  // set when status transitions to Planning
        MCEStatus status;
        uint256 votesFor;
        uint256 votesAgainst;
    }

    mapping(uint256 => MCE) public mces;
    uint256 public nextMCEId = 1;

    /// @dev Track who voted on which MCE.
    mapping(uint256 mceId => mapping(address voter => bool)) public hasVoted;

    /// @dev Track which MCEs a proposer has submitted (for dashboard).
    mapping(address => uint256[]) public proposerMCEs;

    event MCEProposed(
        uint256 indexed mceId,
        address indexed proposer,
        string title,
        uint64 votingEndsAt
    );
    event VoteCast(uint256 indexed mceId, address indexed voter, bool support, uint256 weight);
    event MCETransitionedToPlanning(uint256 indexed mceId, uint64 planningEndsAt);
    event MCETransitionedToActive(uint256 indexed mceId);
    event MCEClosed(uint256 indexed mceId);
    event MCERejected(uint256 indexed mceId, uint256 votesFor, uint256 votesAgainst);
    event QuorumUpdated(uint256 newQuorum);
    event TimingsUpdated(uint64 newVotingDuration, uint64 newPlanningDuration);

    error NotIssuer();
    error AlreadyVoted();
    error NoVotingPower();
    error WrongStatus(MCEStatus current, MCEStatus expected);
    error VotingNotEnded();
    error PlanningNotEnded();
    error BadMCE();

    constructor(address admin, VoteToken vote, IssuerRegistry issuerReg) {
        VOTE = vote;
        ISSUER_REG = issuerReg;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ---------- Proposal ----------

    function propose(string calldata title, string calldata description, string calldata cityContext)
        external
        whenNotPaused
        returns (uint256 mceId)
    {
        if (!ISSUER_REG.isActiveIssuer(msg.sender)) revert NotIssuer();

        mceId = nextMCEId++;
        uint64 votingEndsAt = uint64(block.timestamp) + votingDuration;

        mces[mceId] = MCE({
            id: mceId,
            title: title,
            description: description,
            cityContext: cityContext,
            proposer: msg.sender,
            proposedAt: uint64(block.timestamp),
            votingEndsAt: votingEndsAt,
            planningEndsAt: 0,
            status: MCEStatus.Proposed,
            votesFor: 0,
            votesAgainst: 0
        });

        proposerMCEs[msg.sender].push(mceId);

        emit MCEProposed(mceId, msg.sender, title, votingEndsAt);
    }

    // ---------- Voting ----------

    /// @notice Cast a vote. Weight = caller's current VoteToken balance.
    function vote(uint256 mceId, bool support) external whenNotPaused nonReentrant {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        if (m.status != MCEStatus.Proposed) revert WrongStatus(m.status, MCEStatus.Proposed);
        require(block.timestamp < m.votingEndsAt, "voting closed");

        if (hasVoted[mceId][msg.sender]) revert AlreadyVoted();

        uint256 weight = VOTE.balanceOf(msg.sender);
        if (weight == 0) revert NoVotingPower();

        hasVoted[mceId][msg.sender] = true;

        if (support) {
            m.votesFor += weight;
        } else {
            m.votesAgainst += weight;
        }

        emit VoteCast(mceId, msg.sender, support, weight);
    }

    // ---------- State transitions (permissionless — anyone calls once time has passed) ----------

    /// @notice Finalize voting once the voting period has ended.
    /// Transitions to Planning (passed) or Rejected (failed).
    function finalizeVote(uint256 mceId) external {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        if (m.status != MCEStatus.Proposed) revert WrongStatus(m.status, MCEStatus.Proposed);
        if (block.timestamp < m.votingEndsAt) revert VotingNotEnded();

        uint256 totalVotes = m.votesFor + m.votesAgainst;

        if (totalVotes >= quorum && m.votesFor > m.votesAgainst) {
            m.status = MCEStatus.Planning;
            m.planningEndsAt = uint64(block.timestamp) + planningDuration;
            emit MCETransitionedToPlanning(mceId, m.planningEndsAt);
        } else {
            m.status = MCEStatus.Rejected;
            emit MCERejected(mceId, m.votesFor, m.votesAgainst);
        }
    }

    /// @notice Transition from Planning → Active once planning period has ended.
    function activateMCE(uint256 mceId) external {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        if (m.status != MCEStatus.Planning) revert WrongStatus(m.status, MCEStatus.Planning);
        if (block.timestamp < m.planningEndsAt) revert PlanningNotEnded();

        m.status = MCEStatus.Active;
        emit MCETransitionedToActive(mceId);
    }

    /// @notice Admin closes an MCE (stops new completions).
    function closeMCE(uint256 mceId) external onlyRole(CITY_ADMIN_ROLE) {
        MCE storage m = mces[mceId];
        if (m.proposedAt == 0) revert BadMCE();
        require(m.status == MCEStatus.Active, "not active");
        m.status = MCEStatus.Closed;
        emit MCEClosed(mceId);
    }

    // ---------- Admin config ----------

    function setTimings(uint64 newVotingDuration, uint64 newPlanningDuration) external onlyRole(CITY_ADMIN_ROLE) {
        votingDuration = newVotingDuration;
        planningDuration = newPlanningDuration;
        emit TimingsUpdated(newVotingDuration, newPlanningDuration);
    }

    function setQuorum(uint256 newQuorum) external onlyRole(CITY_ADMIN_ROLE) {
        quorum = newQuorum;
        emit QuorumUpdated(newQuorum);
    }

    // ---------- Views ----------

    function getMCE(uint256 mceId) external view returns (MCE memory) {
        return mces[mceId];
    }

    function getStatus(uint256 mceId) external view returns (MCEStatus) {
        return mces[mceId].status;
    }

    function getProposerMCEs(address proposer) external view returns (uint256[] memory) {
        return proposerMCEs[proposer];
    }

    function totalMCEs() external view returns (uint256) {
        return nextMCEId - 1;
    }

    /// @notice Returns all MCE IDs in a given status — useful for frontend filtering.
    function getMCEsByStatus(MCEStatus status) external view returns (uint256[] memory) {
        uint256 count = 0;
        uint256 total = nextMCEId - 1;
        for (uint256 i = 1; i <= total; i++) {
            if (mces[i].status == status) count++;
        }
        uint256[] memory result = new uint256[](count);
        uint256 j = 0;
        for (uint256 i = 1; i <= total; i++) {
            if (mces[i].status == status) result[j++] = i;
        }
        return result;
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
