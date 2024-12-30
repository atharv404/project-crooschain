// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITokenPool {
    event SwapInitiated(
        address token,
        uint256 amount,
        uint16 destinationChain,
        address recipient,
        uint256 fee
    );
    
    event SwapCompleted(
        address token,
        uint256 amount,
        address recipient
    );

    event LiquidityAdded(address token, uint256 amount);
    event LiquidityRemoved(address token, uint256 amount);
    event MaxTransactionAmountUpdated(uint256 newAmount);

    function getPoolBalance(address token) external view returns (uint256);
    function processIncomingSwap(address token, uint256 amount, address recipient) external;
    function initiateSwap(
        address token,
        uint256 amount,
        uint16 destinationChain,
        address recipient
    ) external payable;
}