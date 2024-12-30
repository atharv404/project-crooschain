const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy FeeManager
  const FeeManager = await ethers.getContractFactory("FeeManager");
  const feeManager = await FeeManager.deploy("0x...", "0x..."); // Replace with FIBO and ORIO token addresses
  await feeManager.deployed();
  console.log("FeeManager deployed to:", feeManager.address);

  // Deploy TokenPool
  const TokenPool = await ethers.getContractFactory("TokenPool");
  const tokenPool = await TokenPool.deploy(feeManager.address, "0x..."); // Replace with LayerZero endpoint address
  await tokenPool.deployed();
  console.log("TokenPool deployed to:", tokenPool.address);

  // Add supported tokens
  await tokenPool.addSupportedToken("USDC", "0x..."); // Replace with USDC token address
  await tokenPool.addSupportedToken("USDT", "0x..."); // Replace with USDT token address
  console.log("Supported tokens added");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });