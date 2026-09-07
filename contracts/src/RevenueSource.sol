// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Single-asset payment source. Payments are not proof of service delivery.
/// @dev Immutable non-upgradeable source; no refund or recurring-payment logic.
contract RevenueSource is ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable asset;
    uint256 public nextPaymentId = 1;
    mapping(address payer => mapping(bytes32 invoiceId => bool)) public paidInvoices;

    error InvalidPayment();
    error InvoiceAlreadyPaid();
    error UnsupportedTokenBehavior();

    event RevenuePaid(
        address indexed operator,
        address indexed payer,
        uint256 indexed paymentId,
        address asset,
        uint256 amount,
        uint64 paidAt,
        bytes32 invoiceId
    );

    constructor(IERC20 asset_) {
        if (address(asset_).code.length == 0) revert InvalidPayment();
        asset = asset_;
    }

    function pay(address operator, uint256 amount, bytes32 invoiceId) external nonReentrant {
        if (operator == address(0) || operator == msg.sender || amount == 0 || invoiceId == bytes32(0)) {
            revert InvalidPayment();
        }
        if (paidInvoices[msg.sender][invoiceId]) revert InvoiceAlreadyPaid();
        paidInvoices[msg.sender][invoiceId] = true;
        uint256 paymentId = nextPaymentId++;
        uint256 beforeBalance = asset.balanceOf(operator);
        asset.safeTransferFrom(msg.sender, operator, amount);
        if (asset.balanceOf(operator) != beforeBalance + amount) revert UnsupportedTokenBehavior();
        emit RevenuePaid(operator, msg.sender, paymentId, address(asset), amount, uint64(block.timestamp), invoiceId);
    }
}
