// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Fixed-supply demo token. No monetary value; deploy only on testnets.
contract DemoUSD is ERC20 {
    constructor(address recipient) ERC20("Nodra Demo USD - NO VALUE", "ndTEST") {
        require(block.chainid == 11155111 || block.chainid == 102031 || block.chainid == 31337, "testnet only");
        _mint(recipient, 1_000_000e6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
