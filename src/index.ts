import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { TokenPool__factory, FeeManager__factory } from './typechain-types';

const app = express();
app.use(cors());
app.use(express.json());

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const tokenPoolAddress = process.env.TOKEN_POOL_ADDRESS!;
const feeManagerAddress = process.env.FEE_MANAGER_ADDRESS!;

const tokenPool = TokenPool__factory.connect(tokenPoolAddress, wallet);
const feeManager = FeeManager__factory.connect(feeManagerAddress, wallet);

app.get('/api/pool-balances', async (req, res) => {
  try {
    const tokens = ['USDC', 'USDT'];
    const balances = await Promise.all(
      tokens.map(async (token) => ({
        token,
        balance: await tokenPool.getPoolBalance(token),
      }))
    );
    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pool balances' });
  }
});

app.get('/api/fees', async (req, res) => {
  try {
    const baseFee = await feeManager.baseFee();
    const discountedFee = await feeManager.discountedFee();
    res.json({ baseFee, discountedFee });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch fees' });
  }
});

app.post('/api/initiate-swap', async (req, res) => {
  try {
    const { token, amount, destinationChain, recipient } = req.body;
    const tx = await tokenPool.initiateSwap(token, amount, destinationChain, recipient);
    await tx.wait();
    res.json({ success: true, transactionHash: tx.hash });
  } catch (error) {
    res.status(500).json({ error: 'Failed to initiate swap' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

