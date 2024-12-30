// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IFeeManager.sol";

contract FeeManager is IFeeManager, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    uint256 public baseFee = 100; // 1% = 100
    uint256 public discountedFee = 50; // 0.5% = 50
    
    address public immutable FIBO_TOKEN;
    address public immutable ORIO_TOKEN;
    
    struct DiscountToken {
        bool isActive;
        uint256 minimumBalance;
    }
    
    mapping(address => DiscountToken) public discountTokens;
    mapping(address => uint256) public collectedFees;
    
    error InvalidFeeParameters();
    error InvalidDiscountToken();
    error InvalidAmount();
    error ZeroAddress();
    error InsufficientFeeBalance();
    error TransferFailed();

    constructor(address fiboToken, address orioToken) {
        if (fiboToken == address(0) || orioToken == address(0)) revert ZeroAddress();
        
        FIBO_TOKEN = fiboToken;
        ORIO_TOKEN = orioToken;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        
        discountTokens[FIBO_TOKEN] = DiscountToken({
            isActive: true,
            minimumBalance: 100000 * 10**18 // 100,000 FIBO
        });
        
        discountTokens[ORIO_TOKEN] = DiscountToken({
            isActive: true,
            minimumBalance: 10000000 * 10**18 // 10,000,000 ORIO
        });
    }
    
    function calculateFee(
        address user,
        uint256 amount
    ) external view override returns (uint256) {
        if (amount == 0) revert InvalidAmount();
        if (user == address(0)) revert ZeroAddress();
        
        if (isEligibleForDiscount(user)) {
            return (amount * discountedFee) / 10000;
        }
        
        return (amount * baseFee) / 10000;
    }
    
    function processFee(
        address token,
        uint256 amount
    ) external override nonReentrant whenNotPaused {
        if (amount == 0) revert InvalidAmount();
        if (token == address(0)) revert ZeroAddress();
        
        collectedFees[token] += amount;
        emit FeeCollected(token, amount);
    }
    
    function setFees(
        uint256 newBaseFee,
        uint256 newDiscountedFee
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        if (newBaseFee <= newDiscountedFee || newBaseFee > 1000) 
            revert InvalidFeeParameters();
        
        baseFee = newBaseFee;
        discountedFee = newDiscountedFee;
        
        emit FeesUpdated(newBaseFee, newDiscountedFee);
    }
    
    function updateDiscountTokenThreshold(
        address token,
        uint256 newThreshold
    ) external onlyRole(ADMIN_ROLE) whenNotPaused {
        if (token != FIBO_TOKEN && token != ORIO_TOKEN) 
            revert InvalidDiscountToken();
        
        discountTokens[token].minimumBalance = newThreshold;
        emit DiscountTokenUpdated(token, newThreshold);
    }
    
    function withdrawFees(
        address token,
        address recipient,
        uint256 amount
    ) external onlyRole(ADMIN_ROLE) nonReentrant whenNotPaused {
        if (token == address(0) || recipient == address(0)) revert ZeroAddress();
        if (amount == 0) revert InvalidAmount();
        if (amount > collectedFees[token]) revert InsufficientFeeBalance();
        
        collectedFees[token] -= amount;
        bool success = IERC20(token).transfer(recipient, amount);
        if (!success) revert TransferFailed();
        
        emit FeeWithdrawn(token, recipient, amount);
    }
    
    function isEligibleForDiscount(
        address user
    ) public view override returns (bool) {
        if (user == address(0)) revert ZeroAddress();
        
        return (
            IERC20(FIBO_TOKEN).balanceOf(user) >= discountTokens[FIBO_TOKEN].minimumBalance ||
            IERC20(ORIO_TOKEN).balanceOf(user) >= discountTokens[ORIO_TOKEN].minimumBalance
        );
    }
    
    function togglePause() external onlyRole(ADMIN_ROLE) {
        paused() ? _unpause() : _pause();
    }
}

