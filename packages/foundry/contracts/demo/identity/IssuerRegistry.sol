// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/// @notice Demo IssuerRegistry — self-service registration with on-chain org name generation.
/// In the pilot, Issuer approval requires admin review and off-chain verification.
/// Here, any wallet can self-register and is immediately granted CERTIFIED_ISSUER_ROLE
/// so the demo is friction-free.
///
/// Org names are deterministically generated from the registrant's address + registration
/// index: e.g. "Civic Network", "Green Foundation", "Metro Coalition".
/// 8 prefixes × 8 suffixes = 64 unique combinations before collisions, sufficient for demo scale.
contract IssuerRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");
    bytes32 public constant CERTIFIED_ISSUER_ROLE = keccak256("CERTIFIED_ISSUER_ROLE");
    bytes32 public constant STATS_UPDATER_ROLE = keccak256("STATS_UPDATER_ROLE");

    struct IssuerProfile {
        string orgName;
        uint64 registeredAt;
        bool active;
        uint256 totalTasksIssued;
        uint256 totalCreditsIssued;
    }

    mapping(address => IssuerProfile) public profiles;
    address[] public allIssuers;

    event IssuerRegistered(address indexed issuer, string orgName);
    event IssuerDeactivated(address indexed issuer, string reason);
    event IssuerReactivated(address indexed issuer);
    event IssuanceRecorded(address indexed issuer, uint256 credits, uint256 totalTasks, uint256 totalCredits);

    error AlreadyRegistered();
    error NotRegistered();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    // ---------- Self-registration ----------

    /// @notice Any wallet calls this to become a demo Issuer.
    /// Returns the auto-generated org name so the frontend can display the welcome message.
    function register() external whenNotPaused returns (string memory orgName) {
        if (profiles[msg.sender].registeredAt != 0) revert AlreadyRegistered();

        orgName = _generateOrgName(msg.sender, allIssuers.length);

        profiles[msg.sender] = IssuerProfile({
            orgName: orgName,
            registeredAt: uint64(block.timestamp),
            active: true,
            totalTasksIssued: 0,
            totalCreditsIssued: 0
        });

        allIssuers.push(msg.sender);
        _grantRole(CERTIFIED_ISSUER_ROLE, msg.sender);

        emit IssuerRegistered(msg.sender, orgName);
    }

    // ---------- Admin ----------

    function deactivateIssuer(address issuer, string calldata reason) external onlyRole(CITY_ADMIN_ROLE) {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();
        p.active = false;
        _revokeRole(CERTIFIED_ISSUER_ROLE, issuer);
        emit IssuerDeactivated(issuer, reason);
    }

    function reactivateIssuer(address issuer) external onlyRole(CITY_ADMIN_ROLE) {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();
        p.active = true;
        _grantRole(CERTIFIED_ISSUER_ROLE, issuer);
        emit IssuerReactivated(issuer);
    }

    /// @notice Called by MCETaskRegistry / OpportunityManager to update issuance stats.
    /// Caller must hold STATS_UPDATER_ROLE (granted to task registries during deployment).
    function recordIssuance(address issuer, uint256 credits) external onlyRole(STATS_UPDATER_ROLE) {
        IssuerProfile storage p = profiles[issuer];
        if (p.registeredAt == 0) revert NotRegistered();
        p.totalTasksIssued += 1;
        p.totalCreditsIssued += credits;
        emit IssuanceRecorded(issuer, credits, p.totalTasksIssued, p.totalCreditsIssued);
    }

    // ---------- Views ----------

    function getAllIssuers() external view returns (address[] memory) {
        return allIssuers;
    }

    function getProfile(address issuer) external view returns (IssuerProfile memory) {
        return profiles[issuer];
    }

    function isActiveIssuer(address issuer) external view returns (bool) {
        return profiles[issuer].active && hasRole(CERTIFIED_ISSUER_ROLE, issuer);
    }

    function issuerCount() external view returns (uint256) {
        return allIssuers.length;
    }

    // ---------- Name generation ----------

    function _generateOrgName(address account, uint256 idx) internal pure returns (string memory) {
        bytes32 h = keccak256(abi.encodePacked(account, idx));
        return string(abi.encodePacked(_prefix(uint8(h[0]) % 8), " ", _suffix(uint8(h[1]) % 8)));
    }

    function _prefix(uint8 i) internal pure returns (string memory) {
        if (i == 0) return "Metro";
        if (i == 1) return "Civic";
        if (i == 2) return "Urban";
        if (i == 3) return "Green";
        if (i == 4) return "Public";
        if (i == 5) return "Community";
        if (i == 6) return "City";
        return "Open";
    }

    function _suffix(uint8 i) internal pure returns (string memory) {
        if (i == 0) return "Initiative";
        if (i == 1) return "Coalition";
        if (i == 2) return "Alliance";
        if (i == 3) return "Network";
        if (i == 4) return "Foundation";
        if (i == 5) return "Collaborative";
        if (i == 6) return "Works";
        return "Commons";
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
