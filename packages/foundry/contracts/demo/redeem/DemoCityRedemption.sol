// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { CityToken } from "../../citysync/token/CityToken.sol";
import { RedemptionReceipt } from "../../citysync/redeem/RedemptionReceipt.sol";
import { DemoRedeemerRegistry } from "../identity/DemoRedeemerRegistry.sol";

/// @notice DemoCityRedemption burns CITY for offerings committed in DemoRedeemerRegistry.
/// @dev This keeps demo redemption flows aligned with self-service demo redeemer onboarding.
contract DemoCityRedemption is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    CityToken public immutable CITY;
    DemoRedeemerRegistry public immutable REGISTRY;
    RedemptionReceipt public immutable RECEIPT;

    /// @dev Tracks total CITY burned per redeemer offer.
    mapping(address redeemer => mapping(uint256 offerId => uint256 totalBurned)) public offerTotalBurned;

    /// @dev Tracks user redemption count per offer.
    mapping(address citizen => mapping(address redeemer => mapping(uint256 offerId => uint256))) public citizenUses;

    event CityOfferPurchased(
        uint256 indexed receiptId,
        address indexed citizen,
        address indexed redeemer,
        uint256 offerId,
        uint256 costCity,
        string offerName
    );

    error NotActiveRedeemer();
    error OfferNotFound();
    error OfferNotCityEligible();

    constructor(address admin, CityToken city, DemoRedeemerRegistry registry, RedemptionReceipt receipt) {
        CITY = city;
        REGISTRY = registry;
        RECEIPT = receipt;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    /// @notice Citizen burns CITY to redeem a non-MCE offering.
    function purchaseOffer(address redeemer, uint256 offerId)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 receiptId)
    {
        DemoRedeemerRegistry.RedeemerProfile memory profile = REGISTRY.getProfile(redeemer);
        if (!profile.active || profile.registeredAt == 0) revert NotActiveRedeemer();

        DemoRedeemerRegistry.Offer memory offer = REGISTRY.getOffer(redeemer, offerId);
        if (!offer.active || bytes(offer.name).length == 0) revert OfferNotFound();
        if (offer.mceOnly) revert OfferNotCityEligible();
        if (offer.costCity == 0) revert OfferNotFound();

        CITY.burnFrom(msg.sender, offer.costCity);

        receiptId = RECEIPT.mintTo(msg.sender, redeemer, offerId, offer.costCity);
        offerTotalBurned[redeemer][offerId] += offer.costCity;
        citizenUses[msg.sender][redeemer][offerId] += 1;

        emit CityOfferPurchased(receiptId, msg.sender, redeemer, offerId, offer.costCity, offer.name);
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(CITY_ADMIN_ROLE) {
        _unpause();
    }
}
