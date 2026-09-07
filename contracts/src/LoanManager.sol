// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {CreditPolicy} from "./CreditPolicy.sol";

/// @notice Fixed-term demo loans with a single designated capital provider.
/// @dev Source and settlement demo tokens use an explicit 1:1 base-unit assumption, not a bridge or price feed.
contract LoanManager is ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable asset;
    CreditPolicy public immutable policy;
    address public immutable lender;
    uint256 public immutable feeBps;
    uint256 public immutable term;
    uint256 public nextLoanId = 1;
    uint256 public totalOutstanding;
    mapping(address => uint256) public activeLoan;
    mapping(address => bool) public defaultHistory;

    struct Loan {
        address operator;
        uint256 principal;
        uint256 debt;
        uint256 dueAt;
        bool defaulted;
    }
    mapping(uint256 => Loan) public loans;
    event Funded(uint256 amount);
    event Withdrawn(uint256 amount);
    event Borrowed(uint256 indexed id, address indexed operator, uint256 principal, uint256 debt, uint256 dueAt);
    event Repaid(uint256 indexed id, uint256 amount, uint256 remaining);
    event Defaulted(uint256 indexed id, uint256 unpaidDebt);

    constructor(IERC20 asset_, CreditPolicy policy_, address lender_, uint256 feeBps_, uint256 term_) {
        require(
            address(asset_).code.length > 0 && address(policy_).code.length > 0 && lender_ != address(0),
            "invalid config"
        );
        require(feeBps_ <= 1000 && term_ > 0 && term_ <= 30 days, "invalid terms");
        asset = asset_;
        policy = policy_;
        lender = lender_;
        feeBps = feeBps_;
        term = term_;
    }

    function fund(uint256 amount) external nonReentrant {
        require(msg.sender == lender && amount > 0, "not lender or zero");
        pull(msg.sender, amount);
        emit Funded(amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(msg.sender == lender && amount > 0, "not lender or zero");
        send(lender, amount);
        emit Withdrawn(amount);
    }

    function borrow(uint256 amount) external nonReentrant returns (uint256 id) {
        require(activeLoan[msg.sender] == 0 && !defaultHistory[msg.sender], "existing debt or default");
        require(amount > 0, "zero loan");
        uint256 debt = amount + Math.mulDiv(amount, feeBps, 10000, Math.Rounding.Ceil);
        require(debt <= policy.limit(msg.sender), "credit exceeded");
        id = nextLoanId++;
        loans[id] = Loan(msg.sender, amount, debt, block.timestamp + term, false);
        activeLoan[msg.sender] = id;
        totalOutstanding += debt;
        send(msg.sender, amount);
        emit Borrowed(id, msg.sender, amount, debt, block.timestamp + term);
    }

    function repay(uint256 id, uint256 amount) external nonReentrant {
        Loan storage loan = loans[id];
        require(msg.sender == loan.operator && amount > 0 && amount <= loan.debt, "invalid repayment");
        // A late repayment cannot erase the historical default before anyone calls markDefault.
        if (block.timestamp > loan.dueAt && !loan.defaulted) recordDefault(id, loan);
        loan.debt -= amount;
        totalOutstanding -= amount;
        if (loan.debt == 0) activeLoan[msg.sender] = 0;
        pull(msg.sender, amount);
        emit Repaid(id, amount, loan.debt);
    }

    function markDefault(uint256 id) external {
        Loan storage loan = loans[id];
        require(loan.debt > 0 && block.timestamp > loan.dueAt && !loan.defaulted, "not overdue");
        recordDefault(id, loan);
    }

    function recordDefault(uint256 id, Loan storage loan) private {
        loan.defaulted = true;
        defaultHistory[loan.operator] = true;
        emit Defaulted(id, loan.debt);
    }

    function pull(address from, uint256 amount) private {
        uint256 beforeBalance = asset.balanceOf(address(this));
        asset.safeTransferFrom(from, address(this), amount);
        require(asset.balanceOf(address(this)) == beforeBalance + amount, "inexact transfer");
    }

    function send(address to, uint256 amount) private {
        uint256 beforeBalance = asset.balanceOf(to);
        asset.safeTransfer(to, amount);
        require(asset.balanceOf(to) == beforeBalance + amount, "inexact transfer");
    }
}
