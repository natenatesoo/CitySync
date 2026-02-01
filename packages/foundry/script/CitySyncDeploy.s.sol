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
    function _parsePk(string memory s) internal pure returns (uint256) {
        bytes memory b = bytes(s);
        require(b.length > 0, "empty pk");

        // If it starts with 0x / 0X, parse as hex.
        if (b.length >= 2 && b[0] == "0" && (b[1] == "x" || b[1] == "X")) {
            uint256 x = 0;
            for (uint256 i = 2; i < b.length; i++) {
                uint8 c = uint8(b[i]);
                uint8 v;
                if (c >= 48 && c <= 57) v = c - 48; // 0-9
                else if (c >= 97 && c <= 102) v = c - 87; // a-f
                else if (c >= 65 && c <= 70) v = c - 55; // A-F
                else revert("bad hex");
                x = (x << 4) | uint256(v);
            }
            return x;
        }

        // Otherwise parse as decimal.
        uint256 y = 0;
        for (uint256 i = 0; i < b.length; i++) {
            uint8 c = uint8(b[i]);
            require(c >= 48 && c <= 57, "bad dec");
            y = (y * 10) + uint256(c - 48);
        }
        return y;
    }

    function run() external {
        // Accept either a hex string ("0x...") or decimal string for the deployer key.
        string memory pkStr = vm.envString("DEPLOYER_PRIVATE_KEY");
        uint256 deployerPk = _parsePk(pkStr);
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
