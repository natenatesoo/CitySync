// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";
import { TaskProposalRegistry } from "../contracts/demo/opportunity/TaskProposalRegistry.sol";
import { IssuerRegistry } from "../contracts/demo/identity/IssuerRegistry.sol";

/// @notice Deploys TaskProposalRegistry against an already-deployed IssuerRegistry.
///
/// Prerequisites — set in your .env file:
///   DEPLOYER_PRIVATE_KEY          — wallet that pays gas (same deployer as original demo deploy)
///   NEXT_PUBLIC_ISSUER_REGISTRY   — address of the deployed IssuerRegistry on Base Sepolia
///
/// Usage (from packages/foundry/):
///   forge script script/DeployTaskProposalRegistry.s.sol \
///     --rpc-url baseSepolia \
///     --broadcast \
///     -vvv
///
/// After deployment, copy the printed TaskProposalRegistry address into your
/// frontend .env as NEXT_PUBLIC_TASK_PROPOSAL_REGISTRY.
contract DeployTaskProposalRegistry is Script {
    function run() external {
        uint256 deployerPk  = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address admin       = vm.addr(deployerPk);
        address issuerRegAddr = vm.envAddress("NEXT_PUBLIC_ISSUER_REGISTRY");

        console2.log("=== Deploy TaskProposalRegistry ===");
        console2.log("Network chain ID:", block.chainid);
        console2.log("Admin (deployer):", admin);
        console2.log("IssuerRegistry:  ", issuerRegAddr);

        vm.startBroadcast(deployerPk);

        TaskProposalRegistry registry = new TaskProposalRegistry(
            admin,
            IssuerRegistry(issuerRegAddr)
        );

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== Deployed ===");
        console2.log("TaskProposalRegistry:", address(registry));
        console2.log("");
        console2.log("Add to your frontend .env:");
        console2.log("NEXT_PUBLIC_TASK_PROPOSAL_REGISTRY=", address(registry));
    }
}
