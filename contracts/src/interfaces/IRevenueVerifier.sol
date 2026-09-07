// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Proposed application adapter, NOT the native Creditcoin verifier ABI.
interface IRevenueVerifier {
    /// @dev Implementation must revert on invalid proof or mismatched canonical evidence hash.
    /// Must validate successful payment semantics, source/recipient/asset and replay binding.
    function verifyRevenue(bytes calldata proof, bytes32 evidenceHash) external view returns (bool);
}
