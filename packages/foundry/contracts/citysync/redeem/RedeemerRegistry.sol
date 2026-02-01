// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract RedeemerRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    event RedeemerSet(address indexed redeemer, bool authorized);
    event RedeemerPaused(address indexed redeemer, bool paused);

    event OfferCreated(address indexed redeemer, uint256 indexed offerId, string name, uint256 costCity);
    event OfferStatusSet(address indexed redeemer, uint256 indexed offerId, bool active);

    struct Offer {
        string name;
        uint256 costCity;
        bool active;
    }

    mapping(address => bool) public isAuthorized;
    mapping(address => bool) public isPausedRedeemer;

    // simple directory so citizens can browse redeemers
    address[] public allRedeemers;
    mapping(address => bool) public isKnownRedeemer;

    mapping(address => uint256) public nextOfferId;
    mapping(address => mapping(uint256 => Offer)) public offers;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    function setRedeemer(address redeemer, bool authorized) external onlyRole(CITY_ADMIN_ROLE) {
        isAuthorized[redeemer] = authorized;
        if (authorized && !isKnownRedeemer[redeemer]) {
            isKnownRedeemer[redeemer] = true;
            allRedeemers.push(redeemer);
        }
        emit RedeemerSet(redeemer, authorized);
    }

    // ---------- Offers ----------

    function createOffer(string calldata name, uint256 costCity) external whenNotPaused returns (uint256 offerId) {
        require(isAuthorized[msg.sender] && !isPausedRedeemer[msg.sender], "not redeemer");
        require(costCity > 0, "cost=0");

        offerId = ++nextOfferId[msg.sender];
        offers[msg.sender][offerId] = Offer({ name: name, costCity: costCity, active: true });

        emit OfferCreated(msg.sender, offerId, name, costCity);
    }

    function setOfferActive(uint256 offerId, bool active) external whenNotPaused {
        require(isAuthorized[msg.sender], "not redeemer");
        Offer storage o = offers[msg.sender][offerId];
        require(bytes(o.name).length != 0, "bad offer");
        o.active = active;
        emit OfferStatusSet(msg.sender, offerId, active);
    }

    function getOffer(address redeemer, uint256 offerId) external view returns (Offer memory) {
        return offers[redeemer][offerId];
    }

    function getAllRedeemers() external view returns (address[] memory) {
        return allRedeemers;
    }

    function setRedeemerPaused(address redeemer, bool paused_) external onlyRole(CITY_ADMIN_ROLE) {
        isPausedRedeemer[redeemer] = paused_;
        emit RedeemerPaused(redeemer, paused_);
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(CITY_ADMIN_ROLE) {
        _unpause();
    }

    function canRedeem(address redeemer) external view returns (bool) {
        return !paused() && isAuthorized[redeemer] && !isPausedRedeemer[redeemer];
    }
}
