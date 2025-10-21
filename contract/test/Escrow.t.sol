// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {Escrow} from "../src/Escrow.sol";

// DISCLOSURE : TESTS ARE WRITTEN USING GEMINI

contract EscrowTest is Test {
    
    address public constant CLIENT = address(0x1);
    address public constant FREELANCER = address(0x2);
    address public constant ARBITER = address(0x3);
    address public constant ATTACKER = address(0x4);

    Escrow public escrow;
    uint256 public constant ESCROW_AMOUNT = 1 ether;

    Escrow.Status public constant AWAITING_DEPOSIT = Escrow.Status.AwaitingDeposit;
    Escrow.Status public constant IN_PROGRESS = Escrow.Status.InProgress;
    Escrow.Status public constant COMPLETE = Escrow.Status.Complete;
    Escrow.Status public constant IN_DISPUTE = Escrow.Status.InDispute;
    Escrow.Status public constant CANCELLED = Escrow.Status.Cancelled;

    function setUp() public {
        escrow = new Escrow(CLIENT, ARBITER, ESCROW_AMOUNT, FREELANCER);
        vm.deal(CLIENT, 10 ether);
    }

    function test_ConstructorSetsCorrectState() public view{
        assertEq(escrow.getClient(), CLIENT, "Client address is incorrect");
        assertEq(escrow.getFreelancer(), FREELANCER, "Freelancer address is incorrect");
        assertEq(escrow.getArbiter(), ARBITER, "Arbiter address is incorrect");
        assertEq(escrow.getAmount(), ESCROW_AMOUNT, "Escrow amount is incorrect");
        assertEq(uint(escrow.state()), uint(AWAITING_DEPOSIT), "Initial state should be AwaitingDeposit");
    }

    function test_ClientCanDepositCorrectAmount() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();

        assertEq(address(escrow).balance, ESCROW_AMOUNT, "Contract balance should match deposit");
        assertEq(uint(escrow.state()), uint(IN_PROGRESS), "State should be InProgress after deposit");
    }

    function test_RevertIf_DepositAmountIsIncorrect() public {
        vm.prank(CLIENT);
        vm.expectRevert(Escrow.DepositCorrectAmount.selector);
        escrow.deposit{value: ESCROW_AMOUNT - 1}();
    }

    function test_RevertIf_DepositInInvalidState() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();
        vm.prank(CLIENT);
        vm.expectRevert(Escrow.InvalidStatus.selector);
        escrow.deposit{value: ESCROW_AMOUNT}();
    }

    function test_ClientCanApproveAndReleaseFunds() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();

        uint256 freelancerInitialBalance = FREELANCER.balance;

        vm.prank(CLIENT);
        escrow.approve();

        assertEq(uint(escrow.state()), uint(COMPLETE), "State should be Complete after approval");
        assertEq(address(escrow).balance, 0, "Contract balance should be zero");
        assertEq(FREELANCER.balance, freelancerInitialBalance + ESCROW_AMOUNT, "Freelancer did not receive funds");
    }

    function test_RevertIf_NonClientTriesToApprove() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();

        vm.prank(ATTACKER);
        vm.expectRevert(Escrow.OnlyClientAllowed.selector);
        escrow.approve();
    }

    function test_RevertIf_ApproveInInvalidState() public {
        vm.prank(CLIENT);
        vm.expectRevert(Escrow.InvalidStatus.selector);
        escrow.approve();
    }

    function test_ClientOrFreelancerCanRaiseDispute() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();
        vm.prank(CLIENT);
        escrow.raiseDispute();
        assertEq(uint(escrow.state()), uint(IN_DISPUTE), "State should be InDispute");
        setUp();
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();
       
        vm.prank(FREELANCER);
        escrow.raiseDispute();
        assertEq(uint(escrow.state()), uint(IN_DISPUTE), "State should be InDispute");
    }

    function test_RevertIf_NonPartyTriesToRaiseDispute() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();

        vm.prank(ATTACKER);
        vm.expectRevert(Escrow.NotAllowed.selector);
        escrow.raiseDispute();
    }

    function test_ArbiterCanResolveDisputeForFreelancer() public {
     
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();
        vm.prank(CLIENT);
        escrow.raiseDispute();

        uint256 freelancerInitialBalance = FREELANCER.balance;

        
        vm.prank(ARBITER);
        escrow.resolveDispute(true); 

        assertEq(uint(escrow.state()), uint(COMPLETE), "State should be Complete");
        assertEq(FREELANCER.balance, freelancerInitialBalance + ESCROW_AMOUNT, "Freelancer should have received funds");
        assertEq(address(escrow).balance, 0, "Contract balance should be zero");
    }

    function test_ArbiterCanResolveDisputeForClient() public {
      
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();
        vm.prank(CLIENT);
        escrow.raiseDispute();

        uint256 clientInitialBalance = CLIENT.balance;
        
        vm.prank(ARBITER);
        escrow.resolveDispute(false);

        assertEq(uint(escrow.state()), uint(CANCELLED), "State should be Cancelled");
        assertEq(CLIENT.balance, clientInitialBalance + ESCROW_AMOUNT, "Client should have received refund");
        assertEq(address(escrow).balance, 0, "Contract balance should be zero");
    }

    function test_RevertIf_NonArbiterTriesToResolveDispute() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();
        vm.prank(CLIENT);
        escrow.raiseDispute();

        vm.prank(ATTACKER);
        vm.expectRevert(Escrow.NotAllowed.selector);
        escrow.resolveDispute(true);
    }

    function test_ClientOrFreelancerCanCancelBeforeDeposit() public {
      
        vm.prank(CLIENT);
        escrow.cancel();
        assertEq(uint(escrow.state()), uint(CANCELLED), "State should be Cancelled after client cancels");

        setUp();

        vm.prank(FREELANCER);
        escrow.cancel();
        assertEq(uint(escrow.state()), uint(CANCELLED), "State should be Cancelled after freelancer cancels");
    }

    function test_RevertIf_CancelAfterDeposit() public {
        vm.prank(CLIENT);
        escrow.deposit{value: ESCROW_AMOUNT}();

        vm.prank(CLIENT);
        vm.expectRevert(Escrow.InvalidStatus.selector);
        escrow.cancel();
    }
}
