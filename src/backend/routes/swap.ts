import express from 'express';
import { ethers } from 'ethers';
import { tokenPoolEth, tokenPoolBsc, tokenPoolPolygon, feeManager } from '../server';

const router = express.Router();

router.get('/pool-balances', async (req, res, next) => {
  try {
    const ethUsdcBalance = await tokenPoolEth.getPoolBalance('USDC');
    const ethUsdtBalance = await tokenPoolEth.getPoolBalance('USDT');
    const bscUsdcBalance = await tokenPoolBsc.getPoolBalance('USDC');
    const polygonUsdcBalance = await tokenPoolPolygon.getPoolBalance('USDC');

    res.json({
      ETH: {
        USDC: ethers.utils.formatUnits(ethUsdcBalance, 6),
        USDT: ethers.utils.formatUnits(ethUsdtBalance, 6),
      },
      BSC: {
        USDC: ethers.utils.formatUnits(bscUsdcBalance, 6),
      },
      POLYGON: {
        USDC: ethers.utils.formatUnits(polygonUsdcBalance, 6),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/fees', async (req, res, next) => {
  try {
    const baseFee = await feeManager.baseFee();
    const discountedFee = await feeManager.discountedFee();

    res.json({
      baseFee: ethers.utils.formatUnits(baseFee, 2),
      discountedFee: ethers.utils.formatUnits(discountedFee, 2),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/initiate-swap', async (req, res, next) => {
  try {
    const { sourceChain, destinationChain, token, amount, recipient } = req.body;

    // Validate input
    if (!sourceChain || !destinationChain || !token || !amount || !recipient) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Get the appropriate TokenPool contract based on the source chain
    let tokenPool;
    switch (sourceChain) {
      case 'ETH':
        tokenPool = tokenPoolEth;
        break;
      case 'BSC':
        tokenPool = tokenPoolBsc;
        break;
      case 'POLYGON':
        tokenPool = tokenPoolPolygon;
        break;
      default:
        return res.status(400).json({ error: 'Invalid source chain' });
    }

    // Calculate the fee
    const fee = await feeManager.calculateFee(recipient, ethers.utils.parseUnits(amount, 6));

    // Get the chain ID for the destination chain
    let destinationChainId;
    switch (destinationChain) {
      case 'ETH':
        destinationChainId = 1;
        break;
      case 'BSC':
        destinationChainId = 56;
        break;
      case 'POLYGON':
        destinationChainId = 137;
        break;
      default:
        return res.status(400).json({ error: 'Invalid destination chain' });
    }

    // Estimate gas for the swap
    const gasEstimate = await tokenPool.estimateGas.initiateSwap(
      token,
      ethers.utils.parseUnits(amount, 6),
      destinationChainId,
      recipient
    );

    res.json({
      fee: ethers.utils.formatUnits(fee, 6),
      gasEstimate: gasEstimate.toString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

