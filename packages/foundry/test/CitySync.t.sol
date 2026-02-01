// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";

import { CityToken } from "../contracts/citysync/token/CityToken.sol";
import { VoteToken } from "../contracts/citysync/token/VoteToken.sol";
import { OpportunityManager } from "../contracts/citysync/opportunity/OpportunityManager.sol";
import { RedeemerRegistry } from "../contracts/citysync/redeem/RedeemerRegistry.sol";
import { RedemptionReceipt } from "../contracts/citysync/redeem/RedemptionReceipt.sol";
import { Redemption } from "../contracts/citysync/redeem/Redemption.sol";

contract CitySyncTest is Test {
    address admin = makeAddr("admin");
    address issuer = makeAddr("issuer");
    address verifier = makeAddr("verifier");
    address citizen = makeAddr("citizen");
    address redeemer = makeAddr("redeemer");

    CityToken city;
    VoteToken vote;
    OpportunityManager mgr;
    RedeemerRegistry reg;
    Redemption red;

    function setUp() external {
        city = new CityToken("City Credit", "CITY", admin);
        vote = new VoteToken("City Vote", "VOTE", admin);

        mgr = new OpportunityManager(admin, city, vote);
        reg = new RedeemerRegistry(admin);
        RedemptionReceipt receipt = new RedemptionReceipt(admin);
        red = new Redemption(admin, city, reg, receipt);

        vm.startPrank(admin);

        // allow redemption to mint receipts
        receipt.grantRole(receipt.MINTER_ROLE(), address(red));
        city.grantRole(city.MINTER_ROLE(), address(mgr));
        city.grantRole(city.BURNER_ROLE(), address(red));
        vote.grantRole(vote.MINTER_ROLE(), address(mgr));

        mgr.setIssuerApproved(issuer, true);
        reg.setRedeemer(redeemer, true);
        vm.stopPrank();
    }

    function test_nonTransferable_CITY_revertsTransfer() external {
        // NOTE: vm.prank() only applies to the *next* external call.
        // Calling city.MINTER_ROLE() inside the args would consume the prank.
        bytes32 minterRole = city.MINTER_ROLE();

        vm.prank(admin);
        city.grantRole(minterRole, admin);

        vm.prank(admin);
        city.mintTo(citizen, 1 ether);

        vm.prank(citizen);
        vm.expectRevert(CityToken.NonTransferable.selector);
        city.transfer(makeAddr("other"), 1);
    }

    function test_fullFlow_verify_mints_and_redeem_burns() external {
        // issuer creates opportunity
        vm.prank(issuer);
        uint256 oppId = mgr.createOpportunity(
            "ipfs://metadata",
            10 ether,
            0, // vote defaults 1:1
            address(0),
            OpportunityManager.VerificationMode.DelegatedVerifiers,
            0,
            0,
            0
        );

        // issuer delegates verifier
        vm.prank(issuer);
        mgr.setVerifierForIssuer(issuer, verifier, true);

        // citizen claims + submits completion
        vm.prank(citizen);
        mgr.claimOpportunity(oppId);

        bytes32 proof = keccak256("proof");
        vm.prank(citizen);
        mgr.submitCompletion(oppId, proof);

        // verifier verifies
        vm.prank(verifier);
        mgr.verifyCompletion(oppId, citizen);

        assertEq(city.balanceOf(citizen), 10 ether);
        assertEq(vote.balanceOf(citizen), 10 ether);

        // citizen requests redemption
        vm.prank(citizen);
        bytes32 requestId = red.requestRedemption(redeemer, 4 ether, keccak256("memo"));

        // redeemer finalizes
        vm.prank(redeemer);
        red.finalizeRedemption(requestId, keccak256("ref"));

        assertEq(city.balanceOf(citizen), 6 ether);
        assertEq(vote.balanceOf(citizen), 10 ether);
    }
}
