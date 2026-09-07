// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {INativeQueryVerifier} from "@gluwa/asc-contracts/contracts/write-ability/common/INativeQueryVerifier.sol";

/// @notice Nodra application interface, distinct from the native verifier ABI.
interface IRevenueVerifier {
    struct PaymentProof {
        uint64 chainKey;
        uint64 blockHeight;
        bytes encodedTransaction;
        INativeQueryVerifier.MerkleProof merkleProof;
        INativeQueryVerifier.ContinuityProof continuityProof;
        uint256 logIndex;
    }

    struct Payment {
        address operator;
        address payer;
        uint256 paymentId;
        address asset;
        uint256 amount;
        uint64 paidAt;
        bytes32 invoiceId;
    }
    function verifyRevenue(PaymentProof calldata proof)
        external
        view
        returns (bytes32 evidenceId, Payment memory payment);
}
