//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

event Deposit(address indexed sender, uint256 amount);
event Withdraw(address indexed receiver, uint256 amount);
event RaiseDispute(address indexed raiser);

contract Escrow {
    
    error OnlyClientAllowed();
    error DepositCorrectAmount();
    error InvalidStatus();
    error OnlyFreelancerCanWithdraw();
    error NotAllowed();
    error FailedTransfer();

    enum Status {
        AwaitingDeposit,
        InProgress,
        Complete,
        InDispute,
        Cancelled
    }

    address private client;
    address private freelancer;
    address private arbiter;
    uint256 private amount;
    Status public state;

    constructor(address _client, address _arbiter, uint256 _amount, address _freelancer) {
        client = _client; arbiter = _arbiter; 
        amount = _amount; //amount in wei
        freelancer = _freelancer;
        state = Status.AwaitingDeposit;
    }

    function deposit() external payable {
        if (msg.sender != client) {revert OnlyClientAllowed();}
        if (msg.value != amount) revert DepositCorrectAmount();
        if(state!=Status.AwaitingDeposit) { revert InvalidStatus(); }
        
        state = Status.InProgress;
        emit Deposit(msg.sender, msg.value);
    }

    function approve() external {
        if (msg.sender != client) {revert OnlyClientAllowed();}
        if(state!=Status.InProgress) { revert InvalidStatus(); }

        state = Status.Complete;
        (bool sent, ) = payable(freelancer).call{value: address(this).balance}("");
        if(!sent) {state=Status.InProgress ; revert FailedTransfer(); }
        emit Withdraw(freelancer, amount);

    }

    function raiseDispute() external {
        if(msg.sender != client && msg.sender != freelancer) { revert NotAllowed(); }
        if(state!=Status.InProgress) { revert InvalidStatus(); }

        state = Status.InDispute;
        emit RaiseDispute(msg.sender);
    }

    function resolveDispute(bool decision) external {
        if(msg.sender!=arbiter) { revert NotAllowed(); }
        if(state!=Status.InDispute) {revert InvalidStatus(); }

        if(decision) {
            state = Status.Complete;
            (bool sent, ) = payable(freelancer).call{value: address(this).balance}("");
            if(!sent) {state = Status.InDispute; revert FailedTransfer(); }
        }
        else {
            state = Status.Cancelled; 
            (bool sent, ) = payable(client).call{value: address(this).balance}("");
            if(!sent) {state = Status.InDispute; revert FailedTransfer(); }
              
        }
    }

    function cancel() external {
        if(msg.sender!=client && msg.sender!=freelancer) { revert NotAllowed(); }
        if(state!=Status.AwaitingDeposit) {revert InvalidStatus(); }

        state = Status.Cancelled;
    }

    function getClient() public view returns(address) {
        return client;
    }
    function getFreelancer() public view returns(address) {
        return freelancer;
    }
    function getArbiter() public view returns(address) {
        return arbiter;
    }
    function getAmount() public view returns(uint256) {
        return amount;
    }



}