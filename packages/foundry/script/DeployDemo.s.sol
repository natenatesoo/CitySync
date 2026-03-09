// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Script, console2 } from "forge-std/Script.sol";

// Pilot contracts (shared with demo)
import { CityToken } from "../contracts/citysync/token/CityToken.sol";
import { VoteToken } from "../contracts/citysync/token/VoteToken.sol";
import { RedeemerRegistry } from "../contracts/citysync/redeem/RedeemerRegistry.sol";
import { RedemptionReceipt } from "../contracts/citysync/redeem/RedemptionReceipt.sol";
import { Redemption } from "../contracts/citysync/redeem/Redemption.sol";

// Demo contracts
import { MCECredit } from "../contracts/demo/token/MCECredit.sol";
import { IssuerRegistry } from "../contracts/demo/identity/IssuerRegistry.sol";
import { DemoRedeemerRegistry } from "../contracts/demo/identity/DemoRedeemerRegistry.sol";
import { DemoOpportunityManager } from "../contracts/demo/opportunity/DemoOpportunityManager.sol";
import { MCERegistry } from "../contracts/demo/mce/MCERegistry.sol";
import { MCETaskRegistry } from "../contracts/demo/mce/MCETaskRegistry.sol";
import { MCERedemption } from "../contracts/demo/redeem/MCERedemption.sol";
import { FeedbackRegistry } from "../contracts/demo/feedback/FeedbackRegistry.sol";

/// @notice Full demo deployment script for Base Sepolia.
///
/// Prerequisites — set in your .env file (copy .env.example → .env):
///   DEPLOYER_PRIVATE_KEY  — wallet that pays gas and becomes admin on all contracts
///   ORACLE_ADDRESS        — backend wallet address that signs EIP712 task verifications
///   CITY_NAME             — display name for the demo city (e.g. "Detroit")
///   CITY_CREDIT_SYMBOL    — token symbol for civic credits (e.g. "DET")
///
/// Usage:
///   # Dry run (no broadcast)
///   forge script script/DeployDemo.s.sol --rpc-url baseSepolia
///
///   # Live broadcast to Base Sepolia
///   forge script script/DeployDemo.s.sol --rpc-url baseSepolia --broadcast --verify
///
/// After deployment, contract addresses are written to deployments/84532.json
/// and printed to console. Copy them into your frontend .env.
contract DeployDemo is Script {

    // ---------- Deployed addresses (readable after run()) ----------
    CityToken        public city;
    VoteToken        public vote;
    DemoOpportunityManager public mgr;
    RedeemerRegistry public pilotRedeemerReg;
    RedemptionReceipt public receipt;
    Redemption       public redemption;

    MCECredit        public mceCredit;
    IssuerRegistry   public issuerReg;
    DemoRedeemerRegistry public demoRedeemerReg;
    MCERegistry      public mceReg;
    MCETaskRegistry  public mceTaskReg;
    MCERedemption    public mceRed;
    FeedbackRegistry public feedback;

    function run() external {
        // ---- Read environment ----
        uint256 deployerPk  = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address admin       = vm.addr(deployerPk);
        address oracle      = vm.envAddress("ORACLE_ADDRESS");
        string memory cityName    = vm.envOr("CITY_NAME", string("xCity"));
        string memory creditSymbol = vm.envOr("CITY_CREDIT_SYMBOL", string("CITY"));

        console2.log("=== CitySync Demo Deployment ===");
        console2.log("Network chain ID:", block.chainid);
        console2.log("Admin (deployer):", admin);
        console2.log("Oracle:          ", oracle);
        console2.log("City name:       ", cityName);
        console2.log("");

        vm.startBroadcast(deployerPk);

        // ============================================================
        // 1. PILOT TOKEN LAYER
        //    CityToken and VoteToken are shared across demo and pilot.
        // ============================================================

        city = new CityToken(
            string(abi.encodePacked(cityName, " Civic Credit")),
            creditSymbol,
            admin
        );

        vote = new VoteToken(
            string(abi.encodePacked(cityName, " Vote")),
            string(abi.encodePacked(creditSymbol, "VOTE")),
            admin
        );

        // ============================================================
        // 2. DEMO IDENTITY LAYER
        //    Self-service registration — no admin approval required.
        // ============================================================

        issuerReg      = new IssuerRegistry(admin);
        demoRedeemerReg = new DemoRedeemerRegistry(admin);

        // ============================================================
        // 3. PILOT TASK & REDEMPTION LAYER
        //    Demo manager accepts any active issuer in IssuerRegistry.
        // ============================================================

        mgr              = new DemoOpportunityManager(admin, city, vote, issuerReg);
        pilotRedeemerReg = new RedeemerRegistry(admin);
        receipt          = new RedemptionReceipt(admin);
        redemption       = new Redemption(admin, city, pilotRedeemerReg, receipt);

        // ============================================================
        // 4. DEMO MCE LAYER
        // ============================================================

        mceCredit = new MCECredit(
            string(abi.encodePacked(cityName, " MCE Credit")),
            string(abi.encodePacked(creditSymbol, "MCE")),
            cityName,
            admin
        );

        mceReg     = new MCERegistry(admin, vote, issuerReg);
        mceTaskReg = new MCETaskRegistry(admin, mceCredit, vote, mceReg, issuerReg);

        // ============================================================
        // 5. DEMO REDEMPTION & FEEDBACK
        // ============================================================

        mceRed   = new MCERedemption(admin, mceCredit, demoRedeemerReg);
        feedback = new FeedbackRegistry(admin, city);

        // ============================================================
        // 6. WIRE ROLES
        //    Each contract that needs to call mintTo/burnFrom/recordIssuance
        //    on another contract must be granted the appropriate role.
        // ============================================================

        // --- Pilot: OpportunityManager mints CityToken + VoteToken ---
        city.grantRole(city.MINTER_ROLE(), address(mgr));
        vote.grantRole(vote.MINTER_ROLE(), address(mgr));

        // --- Pilot: Redemption burns CityToken; mints RedemptionReceipts ---
        city.grantRole(city.BURNER_ROLE(), address(redemption));
        receipt.grantRole(receipt.MINTER_ROLE(), address(redemption));

        // --- Demo: MCETaskRegistry mints MCECredit + VoteToken ---
        mceCredit.grantRole(mceCredit.MINTER_ROLE(), address(mceTaskReg));
        vote.grantRole(vote.MINTER_ROLE(), address(mceTaskReg));

        // --- Demo: MCERedemption burns MCECredit ---
        mceCredit.grantRole(mceCredit.BURNER_ROLE(), address(mceRed));

        // --- Demo: MCETaskRegistry updates issuer stats after verification ---
        issuerReg.grantRole(issuerReg.STATS_UPDATER_ROLE(), address(mceTaskReg));

        // --- Demo: Oracle wallet is authorized to sign EIP712 verifications ---
        //     CITY_ADMIN_ROLE on MCETaskRegistry is the signing authority check.
        mceTaskReg.grantRole(mceTaskReg.CITY_ADMIN_ROLE(), oracle);

        vm.stopBroadcast();

        // ============================================================
        // 7. EXPORT + PRINT
        // ============================================================

        _printAddresses();
        _exportDeployments();
    }

    function _printAddresses() internal view {
        console2.log("");
        console2.log("=== Deployed Addresses ===");
        console2.log("");
        console2.log("-- Pilot (shared) --");
        console2.log("CityToken:           ", address(city));
        console2.log("VoteToken:           ", address(vote));
        console2.log("OpportunityManager:  ", address(mgr));
        console2.log("RedeemerRegistry:    ", address(pilotRedeemerReg));
        console2.log("RedemptionReceipt:   ", address(receipt));
        console2.log("Redemption:          ", address(redemption));
        console2.log("");
        console2.log("-- Demo --");
        console2.log("IssuerRegistry:      ", address(issuerReg));
        console2.log("DemoRedeemerRegistry:", address(demoRedeemerReg));
        console2.log("MCECredit:           ", address(mceCredit));
        console2.log("MCERegistry:         ", address(mceReg));
        console2.log("MCETaskRegistry:     ", address(mceTaskReg));
        console2.log("MCERedemption:       ", address(mceRed));
        console2.log("FeedbackRegistry:    ", address(feedback));
        console2.log("");
        console2.log("-- Copy these into your frontend .env --");
        console2.log("NEXT_PUBLIC_CITY_TOKEN=      ", address(city));
        console2.log("NEXT_PUBLIC_VOTE_TOKEN=      ", address(vote));
        console2.log("NEXT_PUBLIC_OPP_MANAGER=     ", address(mgr));
        console2.log("NEXT_PUBLIC_ISSUER_REGISTRY= ", address(issuerReg));
        console2.log("NEXT_PUBLIC_REDEEMER_REGISTRY=", address(demoRedeemerReg));
        console2.log("NEXT_PUBLIC_MCE_CREDIT=      ", address(mceCredit));
        console2.log("NEXT_PUBLIC_MCE_REGISTRY=    ", address(mceReg));
        console2.log("NEXT_PUBLIC_MCE_TASK_REGISTRY=", address(mceTaskReg));
        console2.log("NEXT_PUBLIC_MCE_REDEMPTION=  ", address(mceRed));
        console2.log("NEXT_PUBLIC_FEEDBACK_REGISTRY=", address(feedback));
    }

    function _exportDeployments() internal {
        string memory json;
        string memory chainIdStr = vm.toString(block.chainid);

        // Serialize all contract addresses into a JSON object
        vm.serializeAddress(json, "CityToken",            address(city));
        vm.serializeAddress(json, "VoteToken",            address(vote));
        vm.serializeAddress(json, "OpportunityManager",   address(mgr));
        vm.serializeAddress(json, "RedeemerRegistry",     address(pilotRedeemerReg));
        vm.serializeAddress(json, "RedemptionReceipt",    address(receipt));
        vm.serializeAddress(json, "Redemption",           address(redemption));
        vm.serializeAddress(json, "IssuerRegistry",       address(issuerReg));
        vm.serializeAddress(json, "DemoRedeemerRegistry", address(demoRedeemerReg));
        vm.serializeAddress(json, "MCECredit",            address(mceCredit));
        vm.serializeAddress(json, "MCERegistry",          address(mceReg));
        vm.serializeAddress(json, "MCETaskRegistry",      address(mceTaskReg));
        vm.serializeAddress(json, "MCERedemption",        address(mceRed));
        json = vm.serializeAddress(json, "FeedbackRegistry", address(feedback));

        string memory outPath = string(
            abi.encodePacked(vm.projectRoot(), "/deployments/", chainIdStr, ".json")
        );
        vm.writeJson(json, outPath);
        console2.log("Deployment addresses written to: deployments/", chainIdStr, ".json");
    }
}
