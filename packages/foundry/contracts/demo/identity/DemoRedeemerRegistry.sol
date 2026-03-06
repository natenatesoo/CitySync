// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

/// @notice Demo RedeemerRegistry — self-service registration.
/// Redeemers auto-register, manage their own offerings, and opt in or out of
/// accepting MCECredits alongside regular CivicCredits.
///
/// Org names use a different vocabulary than IssuerRegistry to feel like
/// real businesses and venues: "Corner Market", "District Gym", etc.
contract DemoRedeemerRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    struct RedeemerProfile {
        string orgName;
        uint64 registeredAt;
        bool active;
        bool acceptsMCECredits;
    }

    struct Offer {
        string name;
        string description;
        uint256 costCity;   // amount of CivicCredit (or MCECredit) required
        bool active;
        bool mceOnly;       // if true, only redeemable with MCECredit
    }

    mapping(address => RedeemerProfile) public profiles;
    address[] public allRedeemers;

    mapping(address => uint256) public nextOfferId;
    mapping(address => mapping(uint256 => Offer)) public offers;

    event RedeemerRegistered(address indexed redeemer, string orgName);
    event MCEOptInChanged(address indexed redeemer, bool accepts);
    event OfferCreated(address indexed redeemer, uint256 indexed offerId, string name, uint256 cost, bool mceOnly);
    event OfferRateUpdated(address indexed redeemer, uint256 indexed offerId, uint256 newCost);
    event OfferRemoved(address indexed redeemer, uint256 indexed offerId);
    event RedeemerDeactivated(address indexed redeemer);

    error AlreadyRegistered();
    error NotRedeemer();
    error BadOffer();

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    modifier onlyActiveRedeemer() {
        RedeemerProfile storage p = profiles[msg.sender];
        if (p.registeredAt == 0 || !p.active) revert NotRedeemer();
        _;
    }

    // ---------- Self-registration ----------

    function register() external whenNotPaused returns (string memory orgName) {
        if (profiles[msg.sender].registeredAt != 0) revert AlreadyRegistered();

        orgName = _generateOrgName(msg.sender, allRedeemers.length);

        profiles[msg.sender] = RedeemerProfile({
            orgName: orgName,
            registeredAt: uint64(block.timestamp),
            active: true,
            acceptsMCECredits: false
        });

        allRedeemers.push(msg.sender);
        emit RedeemerRegistered(msg.sender, orgName);
    }

    /// @notice Redeemer opts in or out of accepting MCECredits.
    function setMCEOptIn(bool accepts) external whenNotPaused onlyActiveRedeemer {
        profiles[msg.sender].acceptsMCECredits = accepts;
        emit MCEOptInChanged(msg.sender, accepts);
    }

    // ---------- Offer management ----------

    function createOffer(string calldata name, string calldata description, uint256 costCity, bool mceOnly)
        external
        whenNotPaused
        onlyActiveRedeemer
        returns (uint256 offerId)
    {
        require(costCity > 0, "cost=0");
        // MCE-only offers require the redeemer to have opted in to MCE credits
        if (mceOnly) require(profiles[msg.sender].acceptsMCECredits, "MCE opt-in required");

        offerId = ++nextOfferId[msg.sender];
        offers[msg.sender][offerId] = Offer({
            name: name,
            description: description,
            costCity: costCity,
            active: true,
            mceOnly: mceOnly
        });

        emit OfferCreated(msg.sender, offerId, name, costCity, mceOnly);
    }

    /// @notice Update the credit cost of an existing offer.
    function updateOfferRate(uint256 offerId, uint256 newCost) external whenNotPaused onlyActiveRedeemer {
        require(newCost > 0, "cost=0");
        Offer storage o = offers[msg.sender][offerId];
        if (bytes(o.name).length == 0 || !o.active) revert BadOffer();
        o.costCity = newCost;
        emit OfferRateUpdated(msg.sender, offerId, newCost);
    }

    /// @notice Soft-delete an offer by marking it inactive.
    function removeOffer(uint256 offerId) external whenNotPaused onlyActiveRedeemer {
        Offer storage o = offers[msg.sender][offerId];
        if (bytes(o.name).length == 0) revert BadOffer();
        o.active = false;
        emit OfferRemoved(msg.sender, offerId);
    }

    // ---------- Admin ----------

    function deactivateRedeemer(address redeemer) external onlyRole(CITY_ADMIN_ROLE) {
        profiles[redeemer].active = false;
        emit RedeemerDeactivated(redeemer);
    }

    // ---------- Views ----------

    function getAllRedeemers() external view returns (address[] memory) {
        return allRedeemers;
    }

    function getProfile(address redeemer) external view returns (RedeemerProfile memory) {
        return profiles[redeemer];
    }

    function getOffer(address redeemer, uint256 offerId) external view returns (Offer memory) {
        return offers[redeemer][offerId];
    }

    function isActiveRedeemer(address redeemer) external view returns (bool) {
        return profiles[redeemer].active && profiles[redeemer].registeredAt != 0;
    }

    /// @notice Returns all Redeemers that have opted in to MCECredits.
    function getMCERedeemers() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allRedeemers.length; i++) {
            if (profiles[allRedeemers[i]].active && profiles[allRedeemers[i]].acceptsMCECredits) count++;
        }
        address[] memory result = new address[](count);
        uint256 j = 0;
        for (uint256 i = 0; i < allRedeemers.length; i++) {
            if (profiles[allRedeemers[i]].active && profiles[allRedeemers[i]].acceptsMCECredits) {
                result[j++] = allRedeemers[i];
            }
        }
        return result;
    }

    // ---------- Name generation ----------

    function _generateOrgName(address account, uint256 idx) internal pure returns (string memory) {
        bytes32 h = keccak256(abi.encodePacked(account, idx));
        return string(abi.encodePacked(_adjective(uint8(h[0]) % 6), " ", _venue(uint8(h[1]) % 8)));
    }

    function _adjective(uint8 i) internal pure returns (string memory) {
        if (i == 0) return "Local";
        if (i == 1) return "Corner";
        if (i == 2) return "City";
        if (i == 3) return "Central";
        if (i == 4) return "Community";
        return "District";
    }

    function _venue(uint8 i) internal pure returns (string memory) {
        if (i == 0) return "Market";
        if (i == 1) return "Gym";
        if (i == 2) return "Library";
        if (i == 3) return "Transit Pass";
        if (i == 4) return "Kitchen";
        if (i == 5) return "Arts Center";
        if (i == 6) return "Co-op";
        return "Hub";
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
