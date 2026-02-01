// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";

import { CityToken } from "../contracts/citysync/token/CityToken.sol";
import { VoteToken } from "../contracts/citysync/token/VoteToken.sol";
import { OpportunityManager } from "../contracts/citysync/opportunity/OpportunityManager.sol";
import { RedeemerRegistry } from "../contracts/citysync/redeem/RedeemerRegistry.sol";
import { Redemption } from "../contracts/citysync/redeem/Redemption.sol";

/// @notice Minimal deployment + wiring script.
/// Use: forge script script/CitySyncDeploy.s.sol --rpc-url localhost --broadcast
contract CitySyncDeploy is Script {
    function run() external {
        uint256 deployerPk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address admin = vm.envAddress("CITYSYNC_ADMIN");

        vm.startBroadcast(deployerPk);

        CityToken city = new CityToken("City Credit", "CITY", admin);
        VoteToken vote = new VoteToken("City Vote", "VOTE", admin);

        OpportunityManager mgr = new OpportunityManager(admin, city, vote);
        RedeemerRegistry reg = new RedeemerRegistry(admin);
        Redemption red = new Redemption(admin, city, reg);

        // Wire roles
        // CITY
        city.grantRole(city.MINTER_ROLE(), address(mgr));
        city.grantRole(city.BURNER_ROLE(), address(red));

        // VOTE
        vote.grantRole(vote.MINTER_ROLE(), address(mgr));

        vm.stopBroadcast();

        // Print addresses to console
        console2.log("CITY", address(city));
        console2.log("VOTE", address(vote));
        console2.log("OpportunityManager", address(mgr));
        console2.log("RedeemerRegistry", address(reg));
        console2.log("Redemption", address(red));
    }
}
