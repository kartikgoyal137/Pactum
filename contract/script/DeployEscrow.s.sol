// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {EscrowFactory} from "../src/EscrowFactory.sol";
import {console} from "forge-std/console.sol";

contract DeployEscrowFactory is Script {
    function run() external returns (EscrowFactory) {
        vm.startBroadcast();
        EscrowFactory escrowFactory = new EscrowFactory();
        vm.stopBroadcast();

        console.log("EscrowFactory deployed at:", address(escrowFactory));
        return escrowFactory;
    }
}