// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IRevenueVerifier} from "./interfaces/IRevenueVerifier.sol";
import {
    INativeQueryVerifier,
    NativeQueryVerifierLib
} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";
import {EvmV1Decoder} from "@gluwa/asc-contracts/contracts/common/EvmV1Decoder.sol";

/// @notice Verifies one recognized source's payment receipts and records them once.
/// @dev No loan approval, asset valuation, complete-window coverage or physical telemetry verification.
contract RevenueEvidence is IRevenueVerifier {
    INativeQueryVerifier public immutable verifier;
    uint64 public immutable sourceChainKey;
    address public immutable sourceContract;
    address public immutable sourceAsset;
    uint64 public immutable maxAge;
    bytes32 public immutable policyVersion;
    bytes32 public constant PAYMENT_EVENT =
        keccak256("RevenuePaid(address,address,uint256,address,uint256,uint64,bytes32)");

    mapping(bytes32 evidenceId => bool) public accepted;
    mapping(uint256 paymentId => bool) public usedPayments;
    mapping(bytes32 evidenceId => Payment) public payments;
    mapping(address operator => mapping(uint256 day => uint256 amount)) public dailyRevenue;

    error InvalidConfiguration();
    error WrongChain();
    error InvalidProof();
    error InvalidReceipt();
    error InvalidEvent();
    error InvalidPayment();
    error StalePayment();
    error WrongOperator();
    error AlreadyAccepted();

    event EvidenceAccepted(
        bytes32 indexed evidenceId,
        address indexed operator,
        uint256 indexed paymentId,
        uint256 amount,
        uint64 paidAt,
        uint64 sourceBlock,
        uint256 logIndex,
        bytes32 policyVersion
    );

    constructor(uint64 chainKey_, address source_, address asset_, uint64 maxAge_, bytes32 policy_) {
        if (chainKey_ == 0 || source_ == address(0) || asset_ == address(0) || maxAge_ == 0 || policy_ == bytes32(0)) {
            revert InvalidConfiguration();
        }
        // There is deliberately no injectable verifier / mock-mode switch in production.
        verifier = NativeQueryVerifierLib.getVerifier();
        sourceChainKey = chainKey_;
        sourceContract = source_;
        sourceAsset = asset_;
        maxAge = maxAge_;
        policyVersion = policy_;
    }

    function verifyRevenue(PaymentProof calldata proof)
        public
        view
        returns (bytes32 evidenceId, Payment memory payment)
    {
        if (proof.chainKey != sourceChainKey) revert WrongChain();
        if (!verifier.verify(
                proof.chainKey, proof.blockHeight, proof.encodedTransaction, proof.merkleProof, proof.continuityProof
            )) revert InvalidProof();
        // The native verifier proves inclusion, not successful execution.
        EvmV1Decoder.ReceiptFields memory receipt = EvmV1Decoder.decodeReceiptFields(proof.encodedTransaction);
        if (receipt.receiptStatus != 1) revert InvalidReceipt();
        if (proof.logIndex >= receipt.receiptLogs.length) revert InvalidEvent();
        EvmV1Decoder.LogEntry memory entry = receipt.receiptLogs[proof.logIndex];
        if (
            entry.address_ != sourceContract || entry.topics.length != 4 || entry.topics[0] != PAYMENT_EVENT
                || entry.data.length != 128
        ) revert InvalidEvent();
        // Require canonical indexed addresses, not silently truncated high bytes.
        if (uint256(entry.topics[1]) >> 160 != 0 || uint256(entry.topics[2]) >> 160 != 0) revert InvalidEvent();
        payment.operator = address(uint160(uint256(entry.topics[1])));
        payment.payer = address(uint160(uint256(entry.topics[2])));
        payment.paymentId = uint256(entry.topics[3]);
        (payment.asset, payment.amount, payment.paidAt, payment.invoiceId) =
            abi.decode(entry.data, (address, uint256, uint64, bytes32));
        if (
            payment.asset != sourceAsset || payment.amount == 0 || payment.paymentId == 0
                || payment.operator == address(0) || payment.payer == address(0) || payment.operator == payment.payer
                || payment.invoiceId == bytes32(0)
        ) revert InvalidPayment();
        if (payment.paidAt > block.timestamp || block.timestamp - payment.paidAt > maxAge) revert StalePayment();
        uint64 txIndex = verifier.calculateTxIndex(proof.merkleProof);
        // Excludes policy version: the same payment cannot be reused by changing policy labels.
        evidenceId = keccak256(abi.encode(sourceChainKey, sourceContract, proof.blockHeight, txIndex, proof.logIndex));
    }

    function accept(PaymentProof calldata proof) external returns (bytes32 evidenceId) {
        Payment memory payment;
        (evidenceId, payment) = verifyRevenue(proof);
        // MVP source and Creditcoin operator must control the same EVM address.
        if (payment.operator != msg.sender) revert WrongOperator();
        if (accepted[evidenceId] || usedPayments[payment.paymentId]) revert AlreadyAccepted();
        accepted[evidenceId] = true;
        usedPayments[payment.paymentId] = true;
        payments[evidenceId] = payment;
        dailyRevenue[payment.operator][payment.paidAt / 1 days] += payment.amount;
        emit EvidenceAccepted(
            evidenceId,
            payment.operator,
            payment.paymentId,
            payment.amount,
            payment.paidAt,
            proof.blockHeight,
            proof.logIndex,
            policyVersion
        );
    }
}
