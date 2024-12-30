import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { TokenPool__factory, FeeManager__factory } from '../typechain-types';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import swapRoutes from './routes/swap';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Providers and contract instances
const ethereumProvider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
const bscProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_RPC_URL);
const polygonProvider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);

const tokenPoolEth = TokenPool__factory.connect(process.env.ETH_TOKEN_POOL_ADDRESS!, ethereumProvider);
const tokenPoolBsc = TokenPool__factory.connect(process.env.BSC_TOKEN_POOL_ADDRESS!, bscProvider);
const tokenPoolPolygon = TokenPool__factory.connect(process.env.POLYGON_TOKEN_POOL_ADDRESS!, polygonProvider);

const feeManager = FeeManager__factory.connect(process.env.FEE_MANAGER_ADDRESS!, polygonProvider);

// Routes
app.use('/api/swap', swapRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export { tokenPoolEth, tokenPoolBsc, tokenPoolPolygon, feeManager };

