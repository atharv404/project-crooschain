import express from 'express';
import { ethers } from 'ethers';
import { tokenPoolEth, tokenPoolBsc, tokenPoolPolygon, feeManager } from '../server';

const router = express.Router();

router.post('/update-fees', async (req, res, next) => {
  try {
    const { baseFee, discountedFee } = req.body;

    if (!baseFee || !discountedFee) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const tx = await feeManager.setFees(
      ethers.utils.parseUnits(baseFee, 2),
      ethers.utils.parseUnits(discountedFee, 2)
    );
    await tx.wait();

    res.json({ message: 'Fees updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/update-max-transaction-amount', async (req, res, next) => {
  try {
    const { chain, amount } = req.body;

    if (!chain || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let tokenPool;
    switch (chain) {
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
        return res.status(400).json({ error: 'Invalid chain' });
    }

    const tx = await tokenPool.setMaxTransactionAmount(ethers.utils.parseUnits(amount, 6));
    await tx.wait();

    res.json({ message: 'Max transaction amount updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/add-liquidity', async (req, res, next) => {
  try {
    const { chain, token, amount } = req.body;

    if (!chain || !token || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let tokenPool;
    switch (chain) {
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
        return res.status(400).json({ error: 'Invalid chain' });
    }

    const tx = await tokenPool.addLiquidity(token, ethers.utils.parseUnits(amount, 6));
    await tx.wait();

    res.json({ message: 'Liquidity added successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/remove-liquidity', async (req, res, next) => {
  try {
    const { chain, token, amount } = req.body;

    if (!chain || !token || !amount) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    let tokenPool;
    switch (chain) {
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
        return res.status(400).json({ error: 'Invalid chain' });
    }

    const tx = await tokenPool.removeLiquidity(token, ethers.utils.parseUnits(amount, 6));
    await tx.wait();

    res.json({ message: 'Liquidity removed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

