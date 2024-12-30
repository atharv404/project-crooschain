// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@layerzerolabs/solidity-examples/contracts/lzApp/NonblockingLzApp.sol";
import "./interfaces/IFeeManager.sol";

contract TokenPool is NonblockingLzApp, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    struct SupportedToken {
        address tokenAddress;
        bool isSupported;
    }
    
    mapping(string => SupportedToken) public supportedTokens;
    address public immutable feeManager;
    
    uint256 public maxTransactionAmount = 1000000 * 1e6; // 1M USDC/USDT
    mapping(string => uint256) public poolBalance;
    mapping(uint16 => mapping(address => bool)) public trustedRemoteAddresses;
    
    event LiquidityAdded(string token, uint256 amount);
    event LiquidityRemoved(string token, uint256 amount);
    event SwapInitiated(
        string token,
        uint256 amount,
        uint16 destinationChain,
        address recipient,
        uint256 fee
    );
    event SwapCompleted(
        string token,
        uint256 amount,
        address recipient
    );
    event MaxTransactionAmountUpdated(uint256 newAmount);
    event TrustedRemoteUpdated(uint16 chainId, address remote, bool trusted);
    event SupportedTokenUpdated(string symbol, address tokenAddress, bool isSupported);
    
    error UnsupportedToken();
    error InvalidAmount();
    error InsufficientPoolBalance();
    error ZeroAddress();
    error InvalidChainId();
    error UntrustedRemote();
    
    constructor(
        address _feeManager,
        address _endpoint
    ) NonblockingLzApp(_endpoint) {
        if (_feeManager == address(0)) {
            revert ZeroAddress();
        }
        
        feeManager = _feeManager;
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    function addSupportedToken(string memory symbol, address tokenAddress) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (tokenAddress == address(0)) revert ZeroAddress();
        supportedTokens[symbol] = SupportedToken(tokenAddress, true);
        emit SupportedTokenUpdated(symbol, tokenAddress, true);
    }
    
    function removeSupportedToken(string memory symbol) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        supportedTokens[symbol].isSupported = false;
        emit SupportedTokenUpdated(symbol, supportedTokens[symbol].tokenAddress, false);
    }
    
    function addLiquidity(string memory symbol, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRole(ADMIN_ROLE) 
    {
        if (!isSupported(symbol)) revert UnsupportedToken();
        if (amount == 0) revert InvalidAmount();
        
        IERC20(supportedTokens[symbol].tokenAddress).transferFrom(msg.sender, address(this), amount);
        poolBalance[symbol] += amount;
        emit LiquidityAdded(symbol, amount);
    }
    
    function removeLiquidity(string memory symbol, uint256 amount) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyRole(ADMIN_ROLE) 
    {
        if (!isSupported(symbol)) revert UnsupportedToken();
        if (amount == 0) revert InvalidAmount();
        if (amount > poolBalance[symbol]) revert InsufficientPoolBalance();
        
        poolBalance[symbol] -= amount;
        IERC20(supportedTokens[symbol].tokenAddress).transfer(msg.sender, amount);
        emit LiquidityRemoved(symbol, amount);
    }
    
    function initiateSwap(
        string memory symbol,
        uint256 amount,
        uint16 destinationChain,
        address recipient
    ) external payable nonReentrant whenNotPaused {
        if (!isSupported(symbol)) revert UnsupportedToken();
        if (amount == 0 || amount > maxTransactionAmount) revert InvalidAmount();
        if (recipient == address(0)) revert ZeroAddress();
        
        uint256 fee = IFeeManager(feeManager).calculateFee(msg.sender, amount);
        uint256 totalAmount = amount + fee;
        
        IERC20(supportedTokens[symbol].tokenAddress).transferFrom(msg.sender, address(this), totalAmount);
        poolBalance[symbol] += totalAmount;
        
        IFeeManager(feeManager).processFee(supportedTokens[symbol].tokenAddress, fee);
        
        bytes memory payload = abi.encode(symbol, amount, recipient);
        _lzSend(
            destinationChain,
            payload,
            payable(msg.sender),
            address(0),
            bytes(""),
            msg.value
        );
        
        emit SwapInitiated(symbol, amount, destinationChain, recipient, fee);
    }
    
    function _nonblockingLzReceive(
        uint16 _srcChainId,
        bytes memory _srcAddress,
        uint64 _nonce,
        bytes memory _payload
    ) internal virtual override {
        address srcAddr;
        assembly {
            srcAddr := mload(add(_srcAddress, 20))
        }
        
        if (!trustedRemoteAddresses[_srcChainId][srcAddr]) {
            revert UntrustedRemote();
        }
        
        (string memory symbol, uint256 amount, address recipient) = abi.decode(
            _payload,
            (string, uint256, address)
        );
        
        if (amount > poolBalance[symbol]) revert InsufficientPoolBalance();
        
        poolBalance[symbol] -= amount;
        IERC20(supportedTokens[symbol].tokenAddress).transfer(recipient, amount);
        
        emit SwapCompleted(symbol, amount, recipient);
    }
    
    function setTrustedRemote(
        uint16 chainId,
        address remote,
        bool trusted
    ) external onlyRole(ADMIN_ROLE) {
        if (chainId == 0) revert InvalidChainId();
        if (remote == address(0)) revert ZeroAddress();
        
        trustedRemoteAddresses[chainId][remote] = trusted;
        emit TrustedRemoteUpdated(chainId, remote, trusted);
    }
    
    function setMaxTransactionAmount(uint256 newAmount) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        if (newAmount == 0) revert InvalidAmount();
        maxTransactionAmount = newAmount;
        emit MaxTransactionAmountUpdated(newAmount);
    }
    
    function togglePause() external onlyRole(ADMIN_ROLE) {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }
    
    function isSupported(string memory symbol) public view returns (bool) {
        return supportedTokens[symbol].isSupported;
    }
    
    function getPoolBalance(string memory symbol) public view returns (uint256) {
        return poolBalance[symbol];
    }
}

