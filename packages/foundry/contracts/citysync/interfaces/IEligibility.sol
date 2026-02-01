// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEligibility {
    /// @notice Return true if `citizen` is eligible to participate in `opportunityId`.
    function isEligible(address citizen, uint256 opportunityId) external view returns (bool);
}
