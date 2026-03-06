// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { MCECredit } from "../token/MCECredit.sol";
import { DemoRedeemerRegistry } from "../identity/DemoRedeemerRegistry.sol";

/// @notice MCERedemption — burns MCECredit in exchange for MCE-specific Redeemer offerings.
///
/// Only Redeemers who have opted in to MCECredits (acceptsMCECredits = true) can
/// have their offerings redeemed here.
///
/// Flow: citizen calls purchaseOffer(redeemer, offerId) → MCECredit burned →
/// RedemptionReceipt event emitted with a unique receipt nonce for off-chain fulfillment.
///
/// Note: This contract does NOT mint an ERC-721 receipt (unlike the pilot Redemption.sol).
/// For the demo, a rich on-chain event is sufficient — the frontend renders the receipt UI.
contract MCERedemption is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    MCECredit public immutable MCE_CREDIT;
    DemoRedeemerRegistry public immutable REGISTRY;

    /// @dev Auto-incrementing receipt counter for uniqueness.
    uint256 public nextReceiptId = 1;

    /// @dev Tracks total MCECredit burned per redeemer offer for analytics.
    mapping(address redeemer => mapping(uint256 offerId => uint256 totalBurned)) public offerTotalBurned;

    /// @dev Tracks individual citizen redemption count per offer.
    mapping(address citizen => mapping(address redeemer => mapping(uint256 offerId => uint256))) public citizenUses;

    event MCEOfferPurchased(
        uint256 indexed receiptId,
        address indexed citizen,
        address indexed redeemer,
        uint256 offerId,
        uint256 costMCE,
        string offerName
    );

    error NotMCERedeemer();
    error OfferNotFound();
    error OfferNotMCEEligible();

    constructor(address admin, MCECredit mceCredit, DemoRedeemerRegistry registry) {
        MCE_CREDIT = mceCredit;
        REGISTRY = registry;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    /// @notice Citizen burns MCECredit to redeem a Redeemer's MCE-eligible offering.
    function purchaseOffer(address redeemer, uint256 offerId)
        external
        whenNotPaused
        nonReentrant
        returns (uint256 receiptId)
    {
        // Redeemer must be active and have opted in to MCECredits
        DemoRedeemerRegistry.RedeemerProfile memory profile = REGISTRY.getProfile(redeemer);
        if (!profile.active || profile.registeredAt == 0) revert NotMCERedeemer();
        if (!profile.acceptsMCECredits) revert NotMCERedeemer();

        // Offer must exist, be active, and be MCE-eligible (mceOnly or general)
        DemoRedeemerRegistry.Offer memory offer = REGISTRY.getOffer(redeemer, offerId);
        if (!offer.active || bytes(offer.name).length == 0) revert OfferNotFound();
        // MCERedemption can only be used for offers that accept MCE credits.
        // mceOnly=true means *only* via this contract.
        // mceOnly=false means the offer is also available in the regular redemption — still allowed here.
        // What's NOT allowed: using CivicCredit here (wrong contract) or using this contract for
        // a redeemer who hasn't opted in (already checked above).

        receiptId = nextReceiptId++;
        uint256 cost = offer.costCity;

        // Burn MCECredit from citizen
        MCE_CREDIT.burnFrom(msg.sender, cost);

        offerTotalBurned[redeemer][offerId] += cost;
        citizenUses[msg.sender][redeemer][offerId] += 1;

        emit MCEOfferPurchased(receiptId, msg.sender, redeemer, offerId, cost, offer.name);
    }

    // ---------- Views ----------

    function getOfferStats(address redeemer, uint256 offerId)
        external
        view
        returns (uint256 totalBurned, uint256 totalUses)
    {
        // totalUses requires iterating citizens — not feasible on-chain.
        // Return totalBurned only; totalUses tracked off-chain via events.
        return (offerTotalBurned[redeemer][offerId], 0);
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(CITY_ADMIN_ROLE) { _unpause(); }
}
