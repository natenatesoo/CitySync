// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice Soul-bound MCE credit token.
/// Distinct from CivicCredit (CityToken) — earned only through Mass Coordination Event tasks.
/// Redeemable at a wider set of offerings from opted-in Redeemers.
/// Non-transferable, burned on redemption.
contract MCECredit is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    /// @notice Human-readable name of the MCE this credit is associated with.
    /// Each MCE deployment may use its own MCECredit instance, or a shared one
    /// where the MCE context is tracked off-chain. For the demo, a single shared
    /// instance is used.
    string public cityName;

    error NonTransferable();

    event CreditsMinted(address indexed to, uint256 amount, uint256 indexed mceId);
    event CreditsBurned(address indexed from, uint256 amount);

    constructor(string memory name_, string memory symbol_, string memory cityName_, address admin)
        ERC20(name_, symbol_)
    {
        cityName = cityName_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // ---------- Minting / burning ----------

    function mintTo(address citizen, uint256 amount, uint256 mceId) external onlyRole(MINTER_ROLE) {
        _mint(citizen, amount);
        emit CreditsMinted(citizen, amount, mceId);
    }

    function burnFrom(address citizen, uint256 amount) external onlyRole(BURNER_ROLE) {
        _burn(citizen, amount);
        emit CreditsBurned(citizen, amount);
    }

    // ---------- Soul-bound enforcement ----------

    function _update(address from, address to, uint256 value) internal override {
        if (from != address(0) && to != address(0)) revert NonTransferable();
        super._update(from, to, value);
    }

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
