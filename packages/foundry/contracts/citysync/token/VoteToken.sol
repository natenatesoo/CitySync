// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { Nonces } from "@openzeppelin/contracts/utils/Nonces.sol";

import { INonTransferable } from "../interfaces/INonTransferable.sol";

/// @notice Non-transferable governance token with checkpointed voting power.
/// Uses ERC20Votes so governance can query historical voting power (snapshot/checkpoints).
contract VoteToken is ERC20, ERC20Permit, ERC20Votes, AccessControl, INonTransferable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    error NonTransferable();

    constructor(string memory name_, string memory symbol_, address admin) ERC20(name_, symbol_) ERC20Permit(name_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function isNonTransferable() external pure returns (bool) {
        return true;
    }

    function mintTo(address citizen, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(citizen, amount);
    }

    /// @dev Disallow transfers (but allow mint/burn). We do not expose burn in MVP.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Votes) {
        if (from != address(0) && to != address(0)) revert NonTransferable();
        super._update(from, to, value);
    }

    // Disable approvals to avoid any confusion.
    function approve(address, uint256) public pure override returns (bool) {
        revert NonTransferable();
    }

    function allowance(address, address) public pure override returns (uint256) {
        return 0;
    }

    function transfer(address, uint256) public pure override returns (bool) {
        revert NonTransferable();
    }

    function transferFrom(address, address, uint256) public pure override returns (bool) {
        revert NonTransferable();
    }

    function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
}
