//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Escrow} from "./Escrow.sol";

event ContractDeployed(address indexed escrow, address c, address f, address a , uint256 amount);

contract EscrowFactory {
    mapping(address clients => address[] contracts) private clientToContract;
    mapping(address freelancers => address[] contracts) private freelancerToContract;

    function createContract(address arbiter, address client, address freelancer, uint256 amount) external {
        Escrow escrow = new Escrow(client, arbiter, amount, freelancer);
        clientToContract[client].push(address(escrow));
        freelancerToContract[freelancer].push(address(escrow));

        emit ContractDeployed(address(escrow), client, freelancer, arbiter, amount);
    }

    function getClientContracts(address client) public view returns(address[] memory) {
        return clientToContract[client];
    }
    
    function getFreelancerContracts(address freelancer) public view returns(address[] memory) {
        return freelancerToContract[freelancer];
    }

}