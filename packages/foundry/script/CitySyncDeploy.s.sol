// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";

import { CityToken } from "../contracts/citysync/token/CityToken.sol";
import { VoteToken } from "../contracts/citysync/token/VoteToken.sol";
import { OpportunityManager } from "../contracts/citysync/opportunity/OpportunityManager.sol";
import { RedeemerRegistry } from "../contracts/citysync/redeem/RedeemerRegistry.sol";
import { RedemptionReceipt } from "../contracts/citysync/redeem/RedemptionReceipt.sol";
import { Redemption } from "../contracts/citysync/redeem/Redemption.sol";

/// @notice Minimal deployment + wiring script.
/// Use: forge script script/CitySyncDeploy.s.sol --rpc-url localhost --broadcast
contract CitySyncDeploy is Script {
    function run() external {
        // Localhost-only deploy:
        // Scaffold-ETH's anvil setup imports a known private key for the default deployer keystore.
        // We use that key directly here so we don't need env vars.
        uint256 deployerPk = 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6;
        address admin = vm.addr(deployerPk);

        vm.startBroadcast(deployerPk);

        CityToken city = new CityToken("City Credit", "CITY", admin);
        VoteToken vote = new VoteToken("City Vote", "VOTE", admin);

        OpportunityManager mgr = new OpportunityManager(admin, city, vote);
        RedeemerRegistry reg = new RedeemerRegistry(admin);
        RedemptionReceipt receipt = new RedemptionReceipt(admin);
        Redemption red = new Redemption(admin, city, reg, receipt);

        // Wire roles
        // CITY
        city.grantRole(city.MINTER_ROLE(), address(mgr));
        city.grantRole(city.BURNER_ROLE(), address(red));

        // VOTE
        vote.grantRole(vote.MINTER_ROLE(), address(mgr));

        // Receipt minter
        receipt.grantRole(receipt.MINTER_ROLE(), address(red));

        vm.stopBroadcast();

        // Print addresses to console
        console2.log("CITY", address(city));
        console2.log("VOTE", address(vote));
        console2.log("OpportunityManager", address(mgr));
        console2.log("RedeemerRegistry", address(reg));
        console2.log("RedemptionReceipt", address(receipt));
        console2.log("Redemption", address(red));
    }
}
