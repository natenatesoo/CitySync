// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

import { CityToken } from "../../citysync/token/CityToken.sol";

/// @notice FeedbackRegistry — on-chain participant feedback on Issuers and Redeemers.
///
/// Design principles:
///  - Only participants who hold at least 1 CivicCredit may submit feedback.
///    This prevents sybil spam without requiring a separate allowlist.
///  - One feedback entry per (participant, target). Can be updated.
///  - Rating: 1–5 (uint8).
///  - Comment: stored as a short string (≤140 chars) directly on-chain for demo simplicity.
///    In a production pilot, comments should be stored as IPFS CIDs to save gas.
///  - Feedback is public and immutable once submitted (update replaces previous).
///  - Admin can hide (soft-delete) abusive feedback without destroying the record.
contract FeedbackRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    CityToken public immutable CIVIC_CREDIT;

    uint8 public constant MIN_RATING = 1;
    uint8 public constant MAX_RATING = 5;
    uint256 public constant MAX_COMMENT_LENGTH = 140;

    /// @dev Minimum CivicCredit balance required to leave feedback (anti-spam gate).
    uint256 public minCreditBalance = 1 ether; // 1 credit (18 decimals)

    struct Feedback {
        address participant;
        uint8 rating;           // 1–5
        string comment;         // short text
        uint64 submittedAt;
        uint64 updatedAt;
        bool hidden;            // admin can hide but not delete
    }

    /// @dev target (issuer or redeemer address) => participant => Feedback
    mapping(address target => mapping(address participant => Feedback)) public feedbacks;

    /// @dev target => list of participants who submitted feedback (for enumeration)
    mapping(address target => address[]) public feedbackParticipants;
    mapping(address target => mapping(address => bool)) private _hasFeedback;

    /// @dev Aggregate stats per target for quick dashboard display.
    mapping(address target => uint256 totalRating) public totalRating;
    mapping(address target => uint256 feedbackCount) public feedbackCount;

    event FeedbackSubmitted(
        address indexed target,
        address indexed participant,
        uint8 rating,
        string comment
    );
    event FeedbackUpdated(
        address indexed target,
        address indexed participant,
        uint8 newRating,
        string newComment
    );
    event FeedbackHidden(address indexed target, address indexed participant, bool hidden);
    event MinCreditBalanceUpdated(uint256 newMin);

    error InsufficientCredits();
    error InvalidRating();
    error CommentTooLong();
    error NoFeedbackToUpdate();

    constructor(address admin, CityToken civicCredit) {
        CIVIC_CREDIT = civicCredit;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ---------- Submit / update ----------

    /// @notice Submit feedback on an Issuer or Redeemer.
    function submitFeedback(address target, uint8 rating, string calldata comment)
        external
        whenNotPaused
    {
        _validateInputs(rating, comment);
        _requireEnoughCredits();

        Feedback storage f = feedbacks[target][msg.sender];

        if (f.submittedAt == 0) {
            // First submission
            f.participant = msg.sender;
            f.submittedAt = uint64(block.timestamp);
            f.updatedAt = uint64(block.timestamp);
            f.rating = rating;
            f.comment = comment;
            f.hidden = false;

            feedbackCount[target] += 1;
            totalRating[target] += rating;

            if (!_hasFeedback[target][msg.sender]) {
                _hasFeedback[target][msg.sender] = true;
                feedbackParticipants[target].push(msg.sender);
            }

            emit FeedbackSubmitted(target, msg.sender, rating, comment);
        } else {
            // Update existing
            totalRating[target] = totalRating[target] - f.rating + rating;
            f.rating = rating;
            f.comment = comment;
            f.updatedAt = uint64(block.timestamp);
            f.hidden = false; // unhide on re-submission

            emit FeedbackUpdated(target, msg.sender, rating, comment);
        }
    }

    // ---------- Admin ----------

    function setFeedbackHidden(address target, address participant, bool hidden)
        external
        onlyRole(CITY_ADMIN_ROLE)
    {
        Feedback storage f = feedbacks[target][participant];
        require(f.submittedAt != 0, "no feedback");
        f.hidden = hidden;
        emit FeedbackHidden(target, participant, hidden);
    }

    function setMinCreditBalance(uint256 newMin) external onlyRole(CITY_ADMIN_ROLE) {
        minCreditBalance = newMin;
        emit MinCreditBalanceUpdated(newMin);
    }

    // ---------- Views ----------

    function getFeedback(address target, address participant) external view returns (Feedback memory) {
        return feedbacks[target][participant];
    }

    function getFeedbackParticipants(address target) external view returns (address[] memory) {
        return feedbackParticipants[target];
    }

    /// @notice Average rating * 100 (to avoid floating point). Returns 0 if no feedback.
    function getAverageRating(address target) external view returns (uint256) {
        uint256 count = feedbackCount[target];
        if (count == 0) return 0;
        return (totalRating[target] * 100) / count;
    }

    /// @notice Returns all visible feedbacks for a target as parallel arrays.
    function getVisibleFeedbacks(address target)
        external
        view
        returns (
            address[] memory participants,
            uint8[] memory ratings,
            string[] memory comments,
            uint64[] memory timestamps
        )
    {
        address[] memory all = feedbackParticipants[target];
        uint256 visible = 0;
        for (uint256 i = 0; i < all.length; i++) {
            if (!feedbacks[target][all[i]].hidden) visible++;
        }

        participants = new address[](visible);
        ratings = new uint8[](visible);
        comments = new string[](visible);
        timestamps = new uint64[](visible);

        uint256 j = 0;
        for (uint256 i = 0; i < all.length; i++) {
            Feedback storage f = feedbacks[target][all[i]];
            if (!f.hidden) {
                participants[j] = f.participant;
                ratings[j] = f.rating;
                comments[j] = f.comment;
                timestamps[j] = f.updatedAt;
                j++;
            }
        }
    }

    // ---------- Internal ----------

    function _validateInputs(uint8 rating, string calldata comment) internal pure {
        if (rating < MIN_RATING || rating > MAX_RATING) revert InvalidRating();
        if (bytes(comment).length > MAX_COMMENT_LENGTH) revert CommentTooLong();
    }

    function _requireEnoughCredits() internal view {
        if (CIVIC_CREDIT.balanceOf(msg.sender) < minCreditBalance) revert InsufficientCredits();
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
