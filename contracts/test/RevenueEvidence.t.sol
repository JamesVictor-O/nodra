// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {RevenueEvidence} from "../src/RevenueEvidence.sol";
import {RevenueSource} from "../src/RevenueSource.sol";
import {IRevenueVerifier} from "../src/interfaces/IRevenueVerifier.sol";
import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";
import {EvmV1Decoder} from "@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface Vm {
    function warp(uint256) external;
    function prank(address) external;
    function etch(address, bytes calldata) external;
    function expectRevert() external;
    function expectRevert(bytes4) external;
    function expectRevert(bytes calldata) external;
}

/// @dev Test-only verifier authenticates the ENTIRE proof payload hash, not just a success bool.
contract MockNativeVerifier {
    bytes32 public allowed;

    function allow(bytes32 hash) external {
        allowed = hash;
    }

    function verify(
        uint64 key,
        uint64 height,
        bytes calldata txBytes,
        INativeQueryVerifier.MerkleProof calldata merkle,
        INativeQueryVerifier.ContinuityProof calldata continuity
    ) external view returns (bool) {
        return keccak256(abi.encode(key, height, txBytes, merkle, continuity)) == allowed;
    }

    function calculateTxIndex(INativeQueryVerifier.MerkleProof calldata) external pure returns (uint64) {
        return 7;
    }
}

contract TestToken is ERC20 {
    bool public chargeFee;

    constructor() ERC20("Nodra TEST USD", "TEST") {
        _mint(msg.sender, 1_000_000e6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function setFee(bool fee) external {
        chargeFee = fee;
    }

    function _update(address from, address to, uint256 amount) internal override {
        if (chargeFee && from != address(0) && to != address(0)) {
            super._update(from, address(0), amount / 100);
            super._update(from, to, amount - amount / 100);
        } else {
            super._update(from, to, amount);
        }
    }
}

abstract contract EvidenceHarness {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    address constant NATIVE = address(0xFD2);
    address constant OPERATOR = address(0xBEEF);
    address constant PAYER = address(0xCAFE);
    address constant SOURCE = address(0x1234);
    address constant ASSET = address(0x5678);
    RevenueEvidence registry;
    MockNativeVerifier mock;

    function setUp() public virtual {
        vm.warp(10 days);
        MockNativeVerifier template = new MockNativeVerifier();
        vm.etch(NATIVE, address(template).code);
        mock = MockNativeVerifier(NATIVE);
        registry = new RevenueEvidence(1, SOURCE, ASSET, 7 days, keccak256("demo-policy-v1"));
    }

    function logFor(uint256 id) internal view returns (EvmV1Decoder.LogEntry memory entry) {
        bytes32[] memory topics = new bytes32[](4);
        topics[0] = registry.PAYMENT_EVENT();
        topics[1] = bytes32(uint256(uint160(OPERATOR)));
        topics[2] = bytes32(uint256(uint160(PAYER)));
        topics[3] = bytes32(id);
        entry = EvmV1Decoder.LogEntry(
            SOURCE, topics, abi.encode(ASSET, uint256(100e6), uint64(block.timestamp), bytes32(id))
        );
    }

    function encodeLogs(EvmV1Decoder.LogEntry[] memory logs, uint8 status) internal pure returns (bytes memory) {
        bytes[] memory chunks = new bytes[](3);
        chunks[0] = abi.encode(uint64(1), uint64(100000), PAYER, false, SOURCE, uint256(0), bytes(""));
        chunks[1] = bytes(""); // Receipt-only decoder; native proof authenticity is mocked in these tests.
        chunks[2] = abi.encode(status, uint64(50000), logs, bytes(""));
        return abi.encode(uint8(2), chunks);
    }

    function proofFor(EvmV1Decoder.LogEntry memory entry, uint8 status)
        internal
        returns (IRevenueVerifier.PaymentProof memory p)
    {
        EvmV1Decoder.LogEntry[] memory logs = new EvmV1Decoder.LogEntry[](1);
        logs[0] = entry;
        p.chainKey = 1;
        p.blockHeight = 100;
        p.encodedTransaction = encodeLogs(logs, status);
        p.merkleProof.root = keccak256("root");
        p.merkleProof.siblings = new INativeQueryVerifier.MerkleProofEntry[](0);
        p.continuityProof.roots = new bytes32[](0);
        authorize(p);
    }

    function authorize(IRevenueVerifier.PaymentProof memory p) internal {
        mock.allow(
            keccak256(abi.encode(p.chainKey, p.blockHeight, p.encodedTransaction, p.merkleProof, p.continuityProof))
        );
    }

    function accept(IRevenueVerifier.PaymentProof memory p) internal returns (bytes32) {
        vm.prank(OPERATOR);
        return registry.accept(p);
    }
}

contract RevenueEvidenceTest is EvidenceHarness {
    function test_acceptAndAggregateOnce() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        bytes32 id = accept(p);
        require(registry.accepted(id), "not recorded");
        require(registry.dailyRevenue(OPERATOR, 10) == 100e6, "wrong revenue");
        vm.expectRevert(RevenueEvidence.AlreadyAccepted.selector);
        accept(p);
        require(registry.dailyRevenue(OPERATOR, 10) == 100e6, "duplicate counted");
    }

    function test_rejectAlteredBytes() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        p.encodedTransaction[p.encodedTransaction.length - 1] = bytes1(uint8(1));
        vm.expectRevert(RevenueEvidence.InvalidProof.selector);
        accept(p);
    }

    function test_rejectAlteredContinuity() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        p.continuityProof.lowerEndpointDigest = keccak256("wrong");
        vm.expectRevert(RevenueEvidence.InvalidProof.selector);
        accept(p);
    }

    function test_rejectWrongChain() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        p.chainKey = 3;
        authorize(p);
        vm.expectRevert(RevenueEvidence.WrongChain.selector);
        accept(p);
    }

    function test_rejectFailedReceipt() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 0);
        vm.expectRevert(RevenueEvidence.InvalidReceipt.selector);
        accept(p);
    }

    function test_rejectSpoofedEmitter() public {
        EvmV1Decoder.LogEntry memory entry = logFor(1);
        entry.address_ = address(99);
        IRevenueVerifier.PaymentProof memory p = proofFor(entry, 1);
        vm.expectRevert(RevenueEvidence.InvalidEvent.selector);
        accept(p);
    }

    function test_rejectWrongOperatorAndPermitRetry() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        vm.expectRevert(RevenueEvidence.WrongOperator.selector);
        registry.accept(p);
        accept(p);
    }

    function test_rejectWrongAsset() public {
        EvmV1Decoder.LogEntry memory entry = logFor(1);
        entry.data = abi.encode(address(99), uint256(100), uint64(block.timestamp), bytes32(uint256(1)));
        IRevenueVerifier.PaymentProof memory p = proofFor(entry, 1);
        vm.expectRevert(RevenueEvidence.InvalidPayment.selector);
        accept(p);
    }

    function test_rejectStaleAndFuture() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        vm.warp(18 days);
        vm.expectRevert(RevenueEvidence.StalePayment.selector);
        accept(p);
        vm.warp(9 days);
        vm.expectRevert(RevenueEvidence.StalePayment.selector);
        accept(p);
    }

    function test_acceptFreshnessBoundary() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        vm.warp(17 days);
        accept(p);
    }

    function test_rejectMalformedTopics() public {
        EvmV1Decoder.LogEntry memory entry = logFor(1);
        entry.topics[1] |= bytes32(uint256(1) << 200);
        IRevenueVerifier.PaymentProof memory p = proofFor(entry, 1);
        vm.expectRevert(RevenueEvidence.InvalidEvent.selector);
        accept(p);
    }

    function test_rejectBadLogIndex() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        p.logIndex = 1;
        vm.expectRevert(RevenueEvidence.InvalidEvent.selector);
        accept(p);
    }

    function test_rejectPaymentIdAcrossDifferentQueries() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        accept(p);
        p.blockHeight = 101;
        authorize(p);
        vm.expectRevert(RevenueEvidence.AlreadyAccepted.selector);
        accept(p);
    }

    function test_acceptTwoDistinctLogsInSameTransaction() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        EvmV1Decoder.LogEntry[] memory logs = new EvmV1Decoder.LogEntry[](2);
        logs[0] = logFor(1);
        logs[1] = logFor(2);
        p.encodedTransaction = encodeLogs(logs, 1);
        authorize(p);
        bytes32 first = accept(p);
        p.logIndex = 1;
        bytes32 second = accept(p);
        require(first != second && registry.dailyRevenue(OPERATOR, 10) == 200e6, "lost multi-log payment");
    }

    function test_nativeUnavailableFailsClosed() public {
        IRevenueVerifier.PaymentProof memory p = proofFor(logFor(1), 1);
        vm.etch(NATIVE, bytes(""));
        vm.expectRevert();
        accept(p);
    }

    function testFuzz_amountPreserved(uint128 amount) public {
        if (amount == 0) return;
        EvmV1Decoder.LogEntry memory entry = logFor(1);
        entry.data = abi.encode(ASSET, uint256(amount), uint64(block.timestamp), bytes32(uint256(1)));
        accept(proofFor(entry, 1));
        require(registry.dailyRevenue(OPERATOR, 10) == amount, "amount changed");
    }
}

contract RevenueSourceTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    TestToken token;
    RevenueSource source;
    address constant OPERATOR = address(0xBEEF);

    function setUp() public {
        token = new TestToken();
        source = new RevenueSource(token);
        token.approve(address(source), type(uint256).max);
    }

    function test_paymentMovesExactAmountAndConsumesInvoice() public {
        uint256 beforeBalance = token.balanceOf(address(this));
        source.pay(OPERATOR, 100e6, bytes32(uint256(1)));
        require(token.balanceOf(OPERATOR) == 100e6 && token.balanceOf(address(source)) == 0, "bad settlement");
        require(beforeBalance - token.balanceOf(address(this)) == 100e6, "payer mismatch");
        vm.expectRevert(RevenueSource.InvoiceAlreadyPaid.selector);
        source.pay(OPERATOR, 100e6, bytes32(uint256(1)));
    }

    function test_rejectSelfPayment() public {
        vm.expectRevert(RevenueSource.InvalidPayment.selector);
        source.pay(address(this), 100, bytes32(uint256(1)));
    }

    function test_rejectZeroAmount() public {
        vm.expectRevert(RevenueSource.InvalidPayment.selector);
        source.pay(OPERATOR, 0, bytes32(uint256(1)));
    }

    function test_insufficientAllowanceRollsBackInvoice() public {
        token.approve(address(source), 0);
        vm.expectRevert();
        source.pay(OPERATOR, 100, bytes32(uint256(1)));
        require(
            !source.paidInvoices(address(this), bytes32(uint256(1))) && source.nextPaymentId() == 1,
            "failed payment consumed"
        );
    }

    function test_feeTokenRejectedAndRolledBack() public {
        token.setFee(true);
        vm.expectRevert(RevenueSource.UnsupportedTokenBehavior.selector);
        source.pay(OPERATOR, 100e6, bytes32(uint256(1)));
        require(token.balanceOf(OPERATOR) == 0 && source.nextPaymentId() == 1, "fee payment persisted");
    }

    function testFuzz_conservation(uint64 raw) public {
        uint256 amount = uint256(raw) % 1_000_000e6 + 1;
        if (amount > token.balanceOf(address(this))) return;
        uint256 beforeBalance = token.balanceOf(address(this));
        source.pay(OPERATOR, amount, bytes32(uint256(1)));
        require(token.balanceOf(OPERATOR) + token.balanceOf(address(this)) == beforeBalance, "funds not conserved");
    }
}
