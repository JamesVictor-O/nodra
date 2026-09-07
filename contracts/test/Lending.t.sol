// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {EvidenceHarness, TestToken} from "./RevenueEvidence.t.sol";
import {IRevenueVerifier} from "../src/interfaces/IRevenueVerifier.sol";
import {CreditPolicy} from "../src/CreditPolicy.sol";
import {LoanManager} from "../src/LoanManager.sol";

contract LendingTest is EvidenceHarness {
    TestToken token;
    CreditPolicy policy;
    LoanManager manager;

    function setUp() public override {
        super.setUp();
        accept(proofFor(logFor(1), 1)); // 100 demo units from a mocked native proof
        token = new TestToken();
        policy = new CreditPolicy(registry, keccak256("demo-policy-v1"), 5000, 1000e6);
        manager = new LoanManager(token, policy, address(this), 100, 7 days);
        token.approve(address(manager), type(uint256).max);
        manager.fund(1000e6);
        token.transfer(OPERATOR, 10e6);
        vm.prank(OPERATOR);
        token.approve(address(manager), type(uint256).max);
    }

    function borrow(uint256 amount) internal returns (uint256) {
        vm.prank(OPERATOR);
        return manager.borrow(amount);
    }

    function test_fundBorrowRepayWithdrawConservesFunds() public {
        uint256 id = borrow(40e6);
        require(manager.totalOutstanding() == 40400000);
        vm.prank(OPERATOR);
        manager.repay(id, 20e6);
        require(manager.totalOutstanding() == 20400000);
        vm.prank(OPERATOR);
        manager.repay(id, 20400000);
        require(manager.activeLoan(OPERATOR) == 0 && manager.totalOutstanding() == 0);
        manager.withdraw(1000400000);
        require(token.balanceOf(address(manager)) == 0);
        require(token.balanceOf(address(this)) + token.balanceOf(OPERATOR) == token.totalSupply());
    }

    function test_feeIncludedInCap() public {
        vm.expectRevert();
        borrow(50e6);
    }

    function test_existingDebtBlocksSecondLoan() public {
        borrow(10e6);
        vm.expectRevert();
        borrow(1);
    }

    function test_midnightExpiresEvidence() public {
        vm.warp(11 days);
        vm.expectRevert();
        borrow(1);
    }

    function test_noEvidenceRejected() public {
        vm.prank(PAYER);
        vm.expectRevert();
        manager.borrow(1);
    }

    function test_lenderAuthorization() public {
        vm.prank(OPERATOR);
        vm.expectRevert();
        manager.withdraw(1);
        vm.prank(OPERATOR);
        vm.expectRevert();
        manager.fund(1);
    }

    function test_defaultRetainsDebtAndBlocksFutureLoans() public {
        uint256 id = borrow(10e6);
        vm.expectRevert();
        manager.markDefault(id);
        vm.warp(17 days + 1);
        manager.markDefault(id);
        require(manager.totalOutstanding() == 10100000 && manager.defaultHistory(OPERATOR));
        vm.prank(OPERATOR);
        manager.repay(id, 10100000);
        require(manager.totalOutstanding() == 0 && manager.defaultHistory(OPERATOR));
        IRevenueVerifier.PaymentProof memory fresh = proofFor(logFor(2), 1);
        fresh.blockHeight += 1;
        authorize(fresh);
        accept(fresh);
        vm.expectRevert();
        borrow(1);
    }

    function test_lateRepaymentRecordsDefault() public {
        uint256 id = borrow(10e6);
        vm.warp(17 days + 1);
        vm.prank(OPERATOR);
        manager.repay(id, 10100000);
        require(manager.defaultHistory(OPERATOR));
    }

    function test_repaymentAuthorizationAndOverpayment() public {
        uint256 id = borrow(10e6);
        vm.expectRevert();
        manager.repay(id, 1);
        vm.prank(OPERATOR);
        vm.expectRevert();
        manager.repay(id, 10100001);
        require(manager.totalOutstanding() == 10100000);
    }

    function test_insufficientLiquidityRollsBack() public {
        manager.withdraw(1000e6);
        vm.expectRevert();
        borrow(1e6);
        require(manager.activeLoan(OPERATOR) == 0 && manager.totalOutstanding() == 0 && manager.nextLoanId() == 1);
    }

    function test_feeTokenRepaymentRollsBack() public {
        uint256 id = borrow(10e6);
        token.setFee(true);
        vm.prank(OPERATOR);
        vm.expectRevert();
        manager.repay(id, 10100000);
        require(manager.totalOutstanding() == 10100000);
    }

    function test_policyMismatchRejected() public {
        vm.expectRevert();
        new CreditPolicy(registry, keccak256("different"), 5000, 1000e6);
    }

    function testFuzz_debtWithinLimit(uint64 raw) public {
        uint256 amount = uint256(raw) % 49e6 + 1;
        borrow(amount);
        require(manager.totalOutstanding() <= policy.limit(OPERATOR));
        require(token.balanceOf(address(manager)) + token.balanceOf(OPERATOR) == 1010e6);
    }
}
