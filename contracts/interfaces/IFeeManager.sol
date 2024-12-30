// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IFeeManager {
    event FeeCollected(address token, uint256 amount);
    event FeesUpdated(uint256 newBaseFee, uint256 newDiscountedFee);
    event DiscountTokenUpdated(address token, uint256 minimumBalance);
    event FeeWithdrawn(address token, address recipient, uint256 amount);

    function calculateFee(address user, uint256 amount) external view returns (uint256);
    function processFee(address token, uint256 amount) external;
    function isEligibleForDiscount(address user) external view returns (bool);
}