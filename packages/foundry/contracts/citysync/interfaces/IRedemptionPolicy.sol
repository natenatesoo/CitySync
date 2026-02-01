// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IRedemptionPolicy {
    /// @notice Return true if a redemption request should be allowed.
    function canRequestRedemption(address citizen, address redeemer, uint256 amount) external view returns (bool);

    /// @notice Return true if a finalization should be allowed.
    function canFinalizeRedemption(bytes32 requestId, address redeemer) external view returns (bool);
}
