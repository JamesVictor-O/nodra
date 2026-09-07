// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {RevenueEvidence} from "./RevenueEvidence.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

/// @notice Explicit short-window demo policy, not a complete-history underwriting model.
/// @dev Uses current UTC day only. Revenue expires at midnight, conservatively before maxAge.
contract CreditPolicy {
    RevenueEvidence public immutable evidence;
    bytes32 public immutable version;
    uint256 public immutable advanceBps;
    uint256 public immutable operatorCap;

    constructor(RevenueEvidence evidence_, bytes32 version_, uint256 advanceBps_, uint256 cap_) {
        require(address(evidence_).code.length > 0 && version_ != bytes32(0), "invalid evidence");
        require(evidence_.policyVersion() == version_ && evidence_.maxAge() >= 1 days, "policy mismatch");
        require(advanceBps_ > 0 && advanceBps_ <= 10000 && cap_ > 0, "invalid parameters");
        evidence = evidence_;
        version = version_;
        advanceBps = advanceBps_;
        operatorCap = cap_;
    }

    function limit(address operator) public view returns (uint256) {
        return Math.min(
            operatorCap, Math.mulDiv(evidence.dailyRevenue(operator, block.timestamp / 1 days), advanceBps, 10000)
        );
    }

    function available(address operator, uint256 outstandingDebt) external view returns (uint256) {
        uint256 cap = limit(operator);
        return outstandingDebt >= cap ? 0 : cap - outstandingDebt;
    }
}
