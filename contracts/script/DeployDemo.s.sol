// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {DemoUSD} from "../src/DemoUSD.sol";
import {RevenueSource} from "../src/RevenueSource.sol";
import {RevenueEvidence} from "../src/RevenueEvidence.sol";
import {CreditPolicy} from "../src/CreditPolicy.sol";
import {LoanManager} from "../src/LoanManager.sol";

interface DeployVm {
    function envAddress(string calldata) external returns (address);
    function startBroadcast() external;
    function stopBroadcast() external;
}

contract DeploySource {
    DeployVm constant vm = DeployVm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (DemoUSD token, RevenueSource source) {
        require(block.chainid == 11155111, "Sepolia required");
        address payer = vm.envAddress("NODRA_PAYER_ADDRESS");
        vm.startBroadcast();
        token = new DemoUSD(payer);
        source = new RevenueSource(token);
        vm.stopBroadcast();
    }
}

contract DeployDestination {
    DeployVm constant vm = DeployVm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (DemoUSD token, RevenueEvidence evidence, CreditPolicy policy, LoanManager loans) {
        require(block.chainid == 102031, "Creditcoin testnet required");
        address source = vm.envAddress("NODRA_SOURCE_ADDRESS");
        address sourceToken = vm.envAddress("NODRA_SOURCE_ASSET");
        address lender = vm.envAddress("NODRA_LENDER_ADDRESS");
        bytes32 version = keccak256("nodra-current-utc-day-demo-v1");
        vm.startBroadcast();
        token = new DemoUSD(lender);
        evidence = new RevenueEvidence(1, source, sourceToken, 1 days, version);
        policy = new CreditPolicy(evidence, version, 5000, 1000e6);
        loans = new LoanManager(token, policy, lender, 100, 7 days);
        vm.stopBroadcast();
    }
}
