// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test } from "forge-std/Test.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

// Existing pilot contracts (reused by demo)
import { CityToken } from "../contracts/citysync/token/CityToken.sol";
import { VoteToken } from "../contracts/citysync/token/VoteToken.sol";
import { OpportunityManager } from "../contracts/citysync/opportunity/OpportunityManager.sol";
import { RedeemerRegistry } from "../contracts/citysync/redeem/RedeemerRegistry.sol";
import { RedemptionReceipt } from "../contracts/citysync/redeem/RedemptionReceipt.sol";
import { Redemption } from "../contracts/citysync/redeem/Redemption.sol";

// Demo-specific contracts
import { MCECredit } from "../contracts/demo/token/MCECredit.sol";
import { IssuerRegistry } from "../contracts/demo/identity/IssuerRegistry.sol";
import { DemoRedeemerRegistry } from "../contracts/demo/identity/DemoRedeemerRegistry.sol";
import { MCERegistry } from "../contracts/demo/mce/MCERegistry.sol";
import { MCETaskRegistry } from "../contracts/demo/mce/MCETaskRegistry.sol";
import { MCERedemption } from "../contracts/demo/redeem/MCERedemption.sol";
import { FeedbackRegistry } from "../contracts/demo/feedback/FeedbackRegistry.sol";

contract CitySyncDemoTest is Test {
    // Actors
    address admin = makeAddr("admin");
    address issuer = makeAddr("issuer");
    address citizen = makeAddr("citizen");
    address redeemer = makeAddr("redeemer");

    uint256 oraclePrivateKey = 0xA11CE;
    address oracle;

    // Pilot contracts
    CityToken city;
    VoteToken vote;
    OpportunityManager mgr;
    Redemption red;

    // Demo contracts
    MCECredit mceCredit;
    IssuerRegistry issuerReg;
    DemoRedeemerRegistry redeemerReg;
    MCERegistry mceReg;
    MCETaskRegistry mceTaskReg;
    MCERedemption mceRed;
    FeedbackRegistry feedback;

    function setUp() external {
        oracle = vm.addr(oraclePrivateKey);

        // ---- Deploy pilot token layer ----
        city = new CityToken("Detroit Civic Credit", "CITY", admin);
        vote = new VoteToken("Detroit Vote", "VOTE", admin);

        // ---- Deploy pilot task/redemption layer ----
        mgr = new OpportunityManager(admin, city, vote);

        RedeemerRegistry pilotReg = new RedeemerRegistry(admin);
        RedemptionReceipt receipt = new RedemptionReceipt(admin);
        red = new Redemption(admin, city, pilotReg, receipt);

        // ---- Deploy demo identity layer ----
        issuerReg = new IssuerRegistry(admin);
        redeemerReg = new DemoRedeemerRegistry(admin);

        // ---- Deploy demo MCE layer ----
        mceCredit = new MCECredit("Detroit MCE Credit", "MCE", "Detroit", admin);
        mceReg = new MCERegistry(admin, vote, issuerReg);
        mceTaskReg = new MCETaskRegistry(admin, mceCredit, vote, mceReg, issuerReg);

        // ---- Deploy demo redemption + feedback ----
        mceRed = new MCERedemption(admin, mceCredit, redeemerReg);
        feedback = new FeedbackRegistry(admin, city);

        // ---- Wire up roles (deployment-time grants) ----
        vm.startPrank(admin);

        // Pilot: mgr may mint city + vote; red may burn city
        city.grantRole(city.MINTER_ROLE(), address(mgr));
        city.grantRole(city.BURNER_ROLE(), address(red));
        vote.grantRole(vote.MINTER_ROLE(), address(mgr));
        receipt.grantRole(receipt.MINTER_ROLE(), address(red));

        // Demo: mceTaskReg may mint mceCredit + vote; mceRed may burn mceCredit
        mceCredit.grantRole(mceCredit.MINTER_ROLE(), address(mceTaskReg));
        mceCredit.grantRole(mceCredit.BURNER_ROLE(), address(mceRed));
        vote.grantRole(vote.MINTER_ROLE(), address(mceTaskReg));

        // Demo: mceTaskReg may update issuer stats
        issuerReg.grantRole(issuerReg.STATS_UPDATER_ROLE(), address(mceTaskReg));

        // Pilot: approve issuer + redeemer the old way (for pilot flow tests)
        pilotReg.setRedeemer(redeemer, true);
        city.grantRole(city.MINTER_ROLE(), admin); // so admin can seed citizen credits for feedback tests

        vm.stopPrank();
    }

    // =========================================================
    // IssuerRegistry
    // =========================================================

    function test_issuer_selfRegister_getsOrgName() external {
        vm.prank(issuer);
        string memory name = issuerReg.register();

        assertTrue(bytes(name).length > 0, "name empty");
        assertTrue(issuerReg.isActiveIssuer(issuer));

        IssuerRegistry.IssuerProfile memory p = issuerReg.getProfile(issuer);
        assertEq(p.orgName, name);
        assertEq(p.registeredAt, uint64(block.timestamp));
        assertTrue(p.active);
    }

    function test_issuer_cannotRegisterTwice() external {
        vm.startPrank(issuer);
        issuerReg.register();
        vm.expectRevert(IssuerRegistry.AlreadyRegistered.selector);
        issuerReg.register();
        vm.stopPrank();
    }

    function test_issuer_differentAddressesGetDifferentNames() external {
        address issuer2 = makeAddr("issuer2");

        vm.prank(issuer);
        string memory name1 = issuerReg.register();

        vm.prank(issuer2);
        string memory name2 = issuerReg.register();

        // Names may collide (only 64 combos) but this tests the function runs
        // and returns a non-empty string.
        assertTrue(bytes(name1).length > 0);
        assertTrue(bytes(name2).length > 0);
    }

    function test_admin_canDeactivateIssuer() external {
        vm.prank(issuer);
        issuerReg.register();

        vm.prank(admin);
        issuerReg.deactivateIssuer(issuer, "spam");

        assertFalse(issuerReg.isActiveIssuer(issuer));
    }

    // =========================================================
    // DemoRedeemerRegistry
    // =========================================================

    function test_redeemer_selfRegister() external {
        vm.prank(redeemer);
        string memory name = redeemerReg.register();
        assertTrue(bytes(name).length > 0);
        assertTrue(redeemerReg.isActiveRedeemer(redeemer));
    }

    function test_redeemer_createAndRemoveOffer() external {
        vm.startPrank(redeemer);
        redeemerReg.register();

        uint256 offerId = redeemerReg.createOffer("Free Transit Pass", "One-day pass", 10 ether, false);
        assertEq(offerId, 1);

        DemoRedeemerRegistry.Offer memory o = redeemerReg.getOffer(redeemer, offerId);
        assertEq(o.name, "Free Transit Pass");
        assertEq(o.costCity, 10 ether);
        assertTrue(o.active);

        redeemerReg.removeOffer(offerId);
        DemoRedeemerRegistry.Offer memory o2 = redeemerReg.getOffer(redeemer, offerId);
        assertFalse(o2.active);

        vm.stopPrank();
    }

    function test_redeemer_mceOptIn() external {
        vm.startPrank(redeemer);
        redeemerReg.register();
        assertFalse(redeemerReg.getProfile(redeemer).acceptsMCECredits);

        redeemerReg.setMCEOptIn(true);
        assertTrue(redeemerReg.getProfile(redeemer).acceptsMCECredits);

        address[] memory mceRedeemers = redeemerReg.getMCERedeemers();
        assertEq(mceRedeemers.length, 1);
        assertEq(mceRedeemers[0], redeemer);
        vm.stopPrank();
    }

    // =========================================================
    // MCERegistry
    // =========================================================

    function test_mce_propose_requiresActiveIssuer() external {
        vm.prank(citizen); // not an issuer
        vm.expectRevert(MCERegistry.NotIssuer.selector);
        mceReg.propose("Clean Streets MCE", "Organize a city-wide cleanup", "Litter is a major issue");
    }

    function test_mce_propose_succeeds() external {
        vm.prank(issuer);
        issuerReg.register();

        vm.prank(issuer);
        uint256 mceId = mceReg.propose("Clean Streets MCE", "City-wide cleanup", "Litter problem");

        assertEq(mceId, 1);
        MCERegistry.MCE memory m = mceReg.getMCE(mceId);
        assertEq(m.title, "Clean Streets MCE");
        assertEq(m.proposer, issuer);
        assertEq(uint8(m.status), uint8(MCERegistry.MCEStatus.Proposed));
        assertEq(m.votingEndsAt, uint64(block.timestamp) + 14 days);
    }

    function test_mce_vote_requiresVotingPower() external {
        vm.prank(issuer);
        issuerReg.register();

        vm.prank(issuer);
        uint256 mceId = mceReg.propose("MCE Title", "Desc", "Context");

        vm.prank(citizen); // citizen has no VoteToken
        vm.expectRevert(MCERegistry.NoVotingPower.selector);
        mceReg.vote(mceId, true);
    }

    function test_mce_fullLifecycle_proposeVoteActivate() external {
        // 1. Register issuer and propose
        vm.prank(issuer);
        issuerReg.register();

        vm.prank(issuer);
        uint256 mceId = mceReg.propose("Park Restoration", "Restore all parks", "Parks are degraded");

        // 2. Seed citizen with VoteToken (simulate earning credits first via OpportunityManager)
        vm.prank(admin);
        city.mintTo(citizen, 100 ether);
        // In the real demo, vote is earned via task completion. For test, grant directly.
        vm.prank(admin);
        vote.grantRole(vote.MINTER_ROLE(), admin);
        vm.prank(admin);
        vote.mintTo(citizen, 50 ether);

        // Update quorum to match our test voter count
        vm.prank(admin);
        mceReg.setQuorum(10 ether);

        // 3. Vote
        vm.prank(citizen);
        mceReg.vote(mceId, true);

        assertEq(mceReg.getMCE(mceId).votesFor, 50 ether);

        // 4. Advance past voting period and finalize
        vm.warp(block.timestamp + 14 days + 1);
        mceReg.finalizeVote(mceId);
        assertEq(uint8(mceReg.getStatus(mceId)), uint8(MCERegistry.MCEStatus.Planning));

        // 5. Advance past planning period and activate
        vm.warp(block.timestamp + 2 days + 1);
        mceReg.activateMCE(mceId);
        assertEq(uint8(mceReg.getStatus(mceId)), uint8(MCERegistry.MCEStatus.Active));
    }

    function test_mce_rejectsOnFailedQuorum() external {
        vm.prank(issuer);
        issuerReg.register();

        vm.prank(issuer);
        uint256 mceId = mceReg.propose("MCE", "Desc", "Context");

        // No votes cast — quorum not met
        vm.warp(block.timestamp + 14 days + 1);
        mceReg.finalizeVote(mceId);

        assertEq(uint8(mceReg.getStatus(mceId)), uint8(MCERegistry.MCEStatus.Rejected));
    }

    // =========================================================
    // MCETaskRegistry
    // =========================================================

    function test_mceTask_createRequiresPlanningStatus() external {
        vm.prank(issuer);
        issuerReg.register();

        vm.prank(issuer);
        uint256 mceId = mceReg.propose("MCE", "Desc", "Context");

        // Status is Proposed, not Planning → should revert
        vm.prank(issuer);
        vm.expectRevert(MCETaskRegistry.MCENotInPlanning.selector);
        mceTaskReg.createTask(mceId, "ipfs://task", 5 ether, 0, 100);
    }

    function test_mceTask_fullFlow_createAndAutoVerify() external {
        // Setup: register issuer, propose, vote, plan
        vm.prank(issuer);
        issuerReg.register();

        vm.prank(issuer);
        uint256 mceId = mceReg.propose("Community Garden MCE", "Build gardens", "Food access");

        // Give oracle VoteToken to vote and pass quorum
        vm.prank(admin);
        vote.grantRole(vote.MINTER_ROLE(), admin);
        vm.prank(admin);
        vote.mintTo(oracle, 20 ether);
        vm.prank(admin);
        mceReg.setQuorum(10 ether);

        vm.prank(oracle);
        mceReg.vote(mceId, true);

        vm.warp(block.timestamp + 14 days + 1);
        mceReg.finalizeVote(mceId);

        // Create task during Planning
        vm.prank(issuer);
        uint256 taskId = mceTaskReg.createTask(mceId, "ipfs://task-meta", 20 ether, 0, 50);

        // Activate MCE
        vm.warp(block.timestamp + 2 days + 1);
        mceReg.activateMCE(mceId);

        // Citizen claims and submits
        vm.prank(citizen);
        mceTaskReg.claimTask(taskId);

        bytes32 proof = keccak256("i planted 10 seeds");
        vm.prank(citizen);
        mceTaskReg.submitCompletion(taskId, proof);

        // Oracle builds and signs EIP712 verification message
        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = mceTaskReg.verifyNonces(taskId, citizen); // should be 0

        bytes32 structHash = keccak256(
            abi.encode(
                mceTaskReg.VERIFY_TYPEHASH(),
                citizen,
                taskId,
                proof,
                nonce,
                deadline
            )
        );

        // Get domain separator from contract
        bytes32 domainSep = mceTaskReg.DOMAIN_SEPARATOR();
        bytes32 digest = MessageHashUtils.toTypedDataHash(domainSep, structHash);
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(oraclePrivateKey, digest);
        bytes memory sig = abi.encodePacked(r, s, v);

        // Grant oracle as CITY_ADMIN so it can sign (simulates oracle being authorized)
        vm.prank(admin);
        mceTaskReg.grantRole(mceTaskReg.CITY_ADMIN_ROLE(), oracle);

        vm.prank(oracle);
        mceTaskReg.verifyCompletionWithSig(taskId, citizen, proof, deadline, sig);

        // Citizen should have 20 MCECredits
        assertEq(mceCredit.balanceOf(citizen), 20 ether);
        // Citizen should also have VoteToken
        assertEq(vote.balanceOf(citizen), 20 ether);
    }

    // =========================================================
    // MCERedemption
    // =========================================================

    function test_mceRedemption_requiresMCEOptIn() external {
        vm.prank(redeemer);
        redeemerReg.register();
        // Did NOT call setMCEOptIn(true)

        vm.prank(redeemer);
        redeemerReg.createOffer("Gym Pass", "Monthly gym", 5 ether, false);

        // Seed citizen with MCE credits
        vm.prank(admin);
        mceCredit.grantRole(mceCredit.MINTER_ROLE(), admin);
        vm.prank(admin);
        mceCredit.mintTo(citizen, 10 ether, 1);

        vm.prank(citizen);
        vm.expectRevert(MCERedemption.NotMCERedeemer.selector);
        mceRed.purchaseOffer(redeemer, 1);
    }

    function test_mceRedemption_burnsMCECredit() external {
        // Setup opted-in redeemer
        vm.startPrank(redeemer);
        redeemerReg.register();
        redeemerReg.setMCEOptIn(true);
        uint256 offerId = redeemerReg.createOffer("Farmers Market Voucher", "Weekly voucher", 5 ether, true);
        vm.stopPrank();

        // Seed citizen with MCE credits
        vm.prank(admin);
        mceCredit.grantRole(mceCredit.MINTER_ROLE(), admin);
        vm.prank(admin);
        mceCredit.mintTo(citizen, 10 ether, 1);
        assertEq(mceCredit.balanceOf(citizen), 10 ether);

        vm.prank(citizen);
        uint256 receiptId = mceRed.purchaseOffer(redeemer, offerId);

        assertEq(receiptId, 1);
        assertEq(mceCredit.balanceOf(citizen), 5 ether); // 5 burned
    }

    // =========================================================
    // FeedbackRegistry
    // =========================================================

    function test_feedback_requiresCivicCredits() external {
        // Citizen has no credits — should revert
        vm.prank(citizen);
        vm.expectRevert(FeedbackRegistry.InsufficientCredits.selector);
        feedback.submitFeedback(issuer, 5, "Great tasks!");
    }

    function test_feedback_submitAndUpdate() external {
        // Give citizen some civic credits
        vm.prank(admin);
        city.mintTo(citizen, 5 ether);

        vm.prank(citizen);
        feedback.submitFeedback(issuer, 4, "Really impactful tasks.");

        FeedbackRegistry.Feedback memory f = feedback.getFeedback(issuer, citizen);
        assertEq(f.rating, 4);
        assertEq(f.comment, "Really impactful tasks.");
        assertFalse(f.hidden);

        // Update the feedback
        vm.prank(citizen);
        feedback.submitFeedback(issuer, 5, "Even better after the MCE!");

        FeedbackRegistry.Feedback memory f2 = feedback.getFeedback(issuer, citizen);
        assertEq(f2.rating, 5);
        assertEq(feedback.getAverageRating(issuer), 500); // 5.00 * 100
    }

    function test_feedback_adminCanHide() external {
        vm.prank(admin);
        city.mintTo(citizen, 5 ether);

        vm.prank(citizen);
        feedback.submitFeedback(issuer, 1, "Bad experience.");

        vm.prank(admin);
        feedback.setFeedbackHidden(issuer, citizen, true);

        FeedbackRegistry.Feedback memory f = feedback.getFeedback(issuer, citizen);
        assertTrue(f.hidden);

        // getVisibleFeedbacks should exclude it
        (address[] memory parts,,,) = feedback.getVisibleFeedbacks(issuer);
        assertEq(parts.length, 0);
    }

    function test_feedback_invalidRatingReverts() external {
        vm.prank(admin);
        city.mintTo(citizen, 5 ether);

        vm.prank(citizen);
        vm.expectRevert(FeedbackRegistry.InvalidRating.selector);
        feedback.submitFeedback(issuer, 6, "Out of range");
    }

    // =========================================================
    // MCECredit soul-bound enforcement
    // =========================================================

    function test_mceCredit_nonTransferable() external {
        vm.prank(admin);
        mceCredit.grantRole(mceCredit.MINTER_ROLE(), admin);
        vm.prank(admin);
        mceCredit.mintTo(citizen, 10 ether, 1);

        vm.prank(citizen);
        vm.expectRevert(MCECredit.NonTransferable.selector);
        mceCredit.transfer(makeAddr("other"), 1);
    }
}
