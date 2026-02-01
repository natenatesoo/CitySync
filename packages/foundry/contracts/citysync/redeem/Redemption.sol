// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import { CityToken } from "../token/CityToken.sol";
import { RedeemerRegistry } from "./RedeemerRegistry.sol";
import { RedemptionReceipt } from "./RedemptionReceipt.sol";
import { IRedemptionPolicy } from "../interfaces/IRedemptionPolicy.sol";

contract Redemption is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    CityToken public immutable CITY;
    RedeemerRegistry public immutable registry;
    RedemptionReceipt public immutable RECEIPT;

    mapping(address => uint256) public lastReceiptId;

    /// @notice Per-citizen usage counts per redemption offering.
    mapping(address citizen => mapping(address redeemer => mapping(uint256 offerId => uint256))) public offerUsesByCitizen;

    /// @notice Aggregate usage counts per redeemer offering.
    mapping(address redeemer => mapping(uint256 offerId => uint256)) public offerUsesTotal;

    // Optional anti-abuse/caps hook
    IRedemptionPolicy public policy; // can be address(0)

    struct RedemptionRequest {
        address citizen;
        address redeemer;
        uint256 amount;
        bytes32 memoHash;
        bool finalized;
    }

    // citizen => nonce
    mapping(address => uint256) public nonces;
    mapping(bytes32 => RedemptionRequest) public requests;

    event RedemptionRequested(
        bytes32 indexed requestId, address indexed citizen, address indexed redeemer, uint256 amount, bytes32 memoHash
    );

    event RedemptionFinalized(
        bytes32 indexed requestId, address indexed citizen, address indexed redeemer, uint256 amount, bytes32 refHash
    );

    event OfferPurchased(
        address indexed citizen,
        address indexed redeemer,
        uint256 indexed offerId,
        uint256 costCity,
        uint256 receiptId
    );

    error NotAuthorizedRedeemer();
    error InvalidRequest();
    error AlreadyFinalized();

    constructor(address admin, CityToken city, RedeemerRegistry reg, RedemptionReceipt receipt) {
        CITY = city;
        registry = reg;
        RECEIPT = receipt;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    function setPolicy(address policy_) external onlyRole(CITY_ADMIN_ROLE) {
        policy = IRedemptionPolicy(policy_);
    }

    /// @notice Citizen creates a redemption request. This is the consent step.
    function requestRedemption(address redeemer, uint256 amount, bytes32 memoHash)
        external
        whenNotPaused
        nonReentrant
        returns (bytes32 requestId)
    {
        if (!registry.canRedeem(redeemer)) revert NotAuthorizedRedeemer();
        require(amount > 0, "amount=0");

        if (address(policy) != address(0)) {
            require(policy.canRequestRedemption(msg.sender, redeemer, amount), "policy reject");
        }

        uint256 nonce = nonces[msg.sender]++;
        requestId =
            keccak256(abi.encodePacked(block.chainid, address(this), msg.sender, redeemer, amount, memoHash, nonce));

        RedemptionRequest storage r = requests[requestId];
        require(r.citizen == address(0), "exists");

        r.citizen = msg.sender;
        r.redeemer = redeemer;
        r.amount = amount;
        r.memoHash = memoHash;
        r.finalized = false;

        emit RedemptionRequested(requestId, msg.sender, redeemer, amount, memoHash);
    }

    /// @notice Authorized redeemer finalizes. Burns CITY.
    function finalizeRedemption(bytes32 requestId, bytes32 refHash) external whenNotPaused nonReentrant {
        if (!registry.canRedeem(msg.sender)) revert NotAuthorizedRedeemer();

        RedemptionRequest storage r = requests[requestId];
        if (r.citizen == address(0)) revert InvalidRequest();
        if (r.finalized) revert AlreadyFinalized();
        require(r.redeemer == msg.sender, "wrong redeemer");

        if (address(policy) != address(0)) {
            require(policy.canFinalizeRedemption(requestId, msg.sender), "policy reject");
        }

        r.finalized = true;

        // burn exact amount from citizen
        CITY.burnFrom(r.citizen, r.amount);

        emit RedemptionFinalized(requestId, r.citizen, msg.sender, r.amount, refHash);
    }

    /// @notice Citizen purchases a redeemer's offering (burns CITY immediately) and receives a non-transferable receipt.
    function purchaseOffer(address redeemer, uint256 offerId) external whenNotPaused nonReentrant returns (uint256 receiptId) {
        if (!registry.canRedeem(redeemer)) revert NotAuthorizedRedeemer();

        RedeemerRegistry.Offer memory offer = registry.getOffer(redeemer, offerId);
        require(offer.active, "inactive offer");
        require(offer.costCity > 0, "bad offer");

        // burn CITY from purchaser
        CITY.burnFrom(msg.sender, offer.costCity);

        // mint receipt to purchaser
        receiptId = RECEIPT.mintTo(msg.sender, redeemer, offerId, offer.costCity);
        lastReceiptId[msg.sender] = receiptId;

        offerUsesByCitizen[msg.sender][redeemer][offerId] += 1;
        offerUsesTotal[redeemer][offerId] += 1;

        emit OfferPurchased(msg.sender, redeemer, offerId, offer.costCity, receiptId);
    }

    function pause() external onlyRole(CITY_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(CITY_ADMIN_ROLE) {
        _unpause();
    }
}
