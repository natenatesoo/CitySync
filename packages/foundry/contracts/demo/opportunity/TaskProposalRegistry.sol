// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IssuerRegistry } from "../identity/IssuerRegistry.sol";

/// @notice Demo TaskProposalRegistry — onchain proposal and approval workflow
/// for new task types before they can be issued via DemoOpportunityManager.
///
/// In production, proposals go through Representative Issuer Committee governance.
/// For the demo, any active issuer may both propose AND approve (playing the committee
/// chair role), which illustrates the full workflow without requiring a separate
/// governance wallet.
///
/// Lifecycle:
///   1. Active issuer calls proposeTask() → Proposal stored onchain, status = Proposed
///   2. Active issuer calls approveTask() → status = Approved (proposer or any issuer)
///   3. Frontend reads the approved proposal and passes its data to
///      DemoOpportunityManager.createOpportunity() to issue the task onchain.
contract TaskProposalRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    IssuerRegistry public immutable ISSUER_REG;

    enum ProposalStatus {
        Proposed,
        Approved,
        Rejected
    }

    struct Proposal {
        address proposer;
        string  title;
        string  description;
        string  successCriteria;
        string  estimatedTime;   // e.g. "2 hours"
        string  location;        // e.g. "Downtown Library"
        uint256 creditReward;    // in whole CITY units (frontend converts to wei)
        uint256 voteReward;      // 0 = match creditReward
        uint64  proposedAt;
        uint64  reviewedAt;
        address reviewedBy;
        ProposalStatus status;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public nextProposalId = 1;

    // Track all proposal IDs per issuer for easy frontend enumeration
    mapping(address => uint256[]) public proposalsByIssuer;

    event TaskProposed(
        uint256 indexed proposalId,
        address indexed proposer,
        string  title,
        uint256 creditReward
    );

    event TaskApproved(
        uint256 indexed proposalId,
        address indexed approver
    );

    event TaskRejected(
        uint256 indexed proposalId,
        address indexed rejector,
        string  reason
    );

    error NotActiveIssuer();
    error ProposalNotFound();
    error AlreadyReviewed();

    constructor(address admin, IssuerRegistry issuerRegistry) {
        ISSUER_REG = issuerRegistry;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ---------- Proposal lifecycle ----------

    /// @notice Submit a new task type for committee approval.
    /// @param title           Short task name shown in the catalog.
    /// @param description     Full task description / context.
    /// @param successCriteria How the issuer will verify completion.
    /// @param estimatedTime   Human-readable time estimate (e.g. "2 hours").
    /// @param location        Where the task takes place (e.g. "City Hall").
    /// @param creditReward    CITY credits to award on completion (whole units).
    /// @param voteReward      VOTE tokens to award (0 = match creditReward).
    function proposeTask(
        string calldata title,
        string calldata description,
        string calldata successCriteria,
        string calldata estimatedTime,
        string calldata location,
        uint256 creditReward,
        uint256 voteReward
    ) external whenNotPaused returns (uint256 proposalId) {
        if (!ISSUER_REG.isActiveIssuer(msg.sender)) revert NotActiveIssuer();
        require(creditReward > 0, "creditReward=0");
        require(bytes(title).length > 0, "empty title");

        proposalId = nextProposalId++;

        proposals[proposalId] = Proposal({
            proposer:        msg.sender,
            title:           title,
            description:     description,
            successCriteria: successCriteria,
            estimatedTime:   estimatedTime,
            location:        location,
            creditReward:    creditReward,
            voteReward:      voteReward,
            proposedAt:      uint64(block.timestamp),
            reviewedAt:      0,
            reviewedBy:      address(0),
            status:          ProposalStatus.Proposed
        });

        proposalsByIssuer[msg.sender].push(proposalId);

        emit TaskProposed(proposalId, msg.sender, title, creditReward);
    }

    /// @notice Approve a pending proposal.
    /// In the demo, any active issuer may approve (including the proposer).
    /// In production this would be restricted to committee members.
    function approveTask(uint256 proposalId) external whenNotPaused {
        if (!ISSUER_REG.isActiveIssuer(msg.sender)) revert NotActiveIssuer();

        Proposal storage p = proposals[proposalId];
        if (p.proposedAt == 0) revert ProposalNotFound();
        if (p.status != ProposalStatus.Proposed) revert AlreadyReviewed();

        p.status     = ProposalStatus.Approved;
        p.reviewedAt = uint64(block.timestamp);
        p.reviewedBy = msg.sender;

        emit TaskApproved(proposalId, msg.sender);
    }

    /// @notice Reject a pending proposal (admin or active issuer).
    function rejectTask(uint256 proposalId, string calldata reason) external whenNotPaused {
        bool isAdmin = hasRole(CITY_ADMIN_ROLE, msg.sender);
        if (!isAdmin && !ISSUER_REG.isActiveIssuer(msg.sender)) revert NotActiveIssuer();

        Proposal storage p = proposals[proposalId];
        if (p.proposedAt == 0) revert ProposalNotFound();
        if (p.status != ProposalStatus.Proposed) revert AlreadyReviewed();

        p.status     = ProposalStatus.Rejected;
        p.reviewedAt = uint64(block.timestamp);
        p.reviewedBy = msg.sender;

        emit TaskRejected(proposalId, msg.sender, reason);
    }

    // ---------- Views ----------

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function getProposalsByIssuer(address issuer) external view returns (uint256[] memory) {
        return proposalsByIssuer[issuer];
    }

    function totalProposals() external view returns (uint256) {
        return nextProposalId - 1;
    }

    // ---------- Admin ----------

    function pause()   external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
