// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

import { INonTransferable } from "../interfaces/INonTransferable.sol";

/// @notice Non-transferable civic credit token.
/// Minted only by OpportunityManager. Burned only by authorized burner(s) (e.g., Redemption).
contract CityToken is ERC20, AccessControl, INonTransferable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    error NonTransferable();

    constructor(string memory name_, string memory symbol_, address admin) ERC20(name_, symbol_) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function isNonTransferable() external pure returns (bool) {
        return true;
    }

    function mintTo(address citizen, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(citizen, amount);
    }

    function burnFrom(address citizen, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(citizen, amount);
    }

    /// @dev OpenZeppelin v5 uses _update(from,to,amount) for mint/burn/transfer.
    /// Disallow transfers where both from and to are non-zero.
    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) revert NonTransferable();
        super._update(from, to, value);
    }

    /// @dev Optional: disable approvals to reduce confusion.
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
}
