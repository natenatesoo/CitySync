// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";

contract RedeemerRegistry is AccessControl, Pausable {
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");

    event RedeemerSet(address indexed redeemer, bool authorized);
    event RedeemerPaused(address indexed redeemer, bool paused);

    mapping(address => bool) public isAuthorized;
    mapping(address => bool) public isPausedRedeemer;

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(CITY_ADMIN_ROLE, admin);
    }

    function setRedeemer(address redeemer, bool authorized) external onlyRole(CITY_ADMIN_ROLE) {
        isAuthorized[redeemer] = authorized;
        emit RedeemerSet(redeemer, authorized);
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
