import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenPool__factory, FeeManager__factory } from '../../typechain-types';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  const [poolBalances, setPoolBalances] = useState<{ symbol: string; balance: string }[]>([]);
  const [baseFee, setBaseFee] = useState('');
  const [discountedFee, setDiscountedFee] = useState('');
  const [maxTransactionAmount, setMaxTransactionAmount] = useState('');
  const [addLiquiditySymbol, setAddLiquiditySymbol] = useState('');
  const [addLiquidityAmount, setAddLiquidityAmount] = useState('');
  const [removeLiquiditySymbol, setRemoveLiquiditySymbol] = useState('');
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState('');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenPoolAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_ADDRESS!;
      const feeManagerAddress = process.env.NEXT_PUBLIC_FEE_MANAGER_ADDRESS!;
      const tokenPool = TokenPool__factory.connect(tokenPoolAddress, provider);
      const feeManager = FeeManager__factory.connect(feeManagerAddress, provider);

      const supportedTokens = ['USDC', 'USDT'];
      const balances = await Promise.all(
        supportedTokens.map(async (symbol) => ({
          symbol,
          balance: ethers.utils.formatUnits(await tokenPool.getPoolBalance(symbol), 6),
        }))
      );
      setPoolBalances(balances);

      const baseFeeValue = await feeManager.baseFee();
      const discountedFeeValue = await feeManager.discountedFee();
      setBaseFee(ethers.utils.formatUnits(baseFeeValue, 2));
      setDiscountedFee(ethers.utils.formatUnits(discountedFeeValue, 2));

      const maxAmount = await tokenPool.maxTransactionAmount();
      setMaxTransactionAmount(ethers.utils.formatUnits(maxAmount, 6));
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data. Please try again.');
    }
  };

  const handleUpdateFees = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const feeManagerAddress = process.env.NEXT_PUBLIC_FEE_MANAGER_ADDRESS!;
      const feeManager = FeeManager__factory.connect(feeManagerAddress, signer);

      const tx = await feeManager.setFees(
        ethers.utils.parseUnits(baseFee, 2),
        ethers.utils.parseUnits(discountedFee, 2)
      );
      await tx.wait();
      alert('Fees updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating fees:', error);
      alert('Failed to update fees. Please try again.');
    }
  };

  const handleUpdateMaxTransactionAmount = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenPoolAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_ADDRESS!;
      const tokenPool = TokenPool__factory.connect(tokenPoolAddress, signer);

      const tx = await tokenPool.setMaxTransactionAmount(ethers.utils.parseUnits(maxTransactionAmount, 6));
      await tx.wait();
      alert('Max transaction amount updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating max transaction amount:', error);
      alert('Failed to update max transaction amount. Please try again.');
    }
  };

  const handleAddLiquidity = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenPoolAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_ADDRESS!;
      const tokenPool = TokenPool__factory.connect(tokenPoolAddress, signer);

      const tx = await tokenPool.addLiquidity(addLiquiditySymbol, ethers.utils.parseUnits(addLiquidityAmount, 6));
      await tx.wait();
      alert('Liquidity added successfully!');
      fetchData();
      setAddLiquiditySymbol('');
      setAddLiquidityAmount('');
    } catch (error) {
      console.error('Error adding liquidity:', error);
      alert('Failed to add liquidity. Please try again.');
    }
  };

  const handleRemoveLiquidity = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenPoolAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_ADDRESS!;
      const tokenPool = TokenPool__factory.connect(tokenPoolAddress, signer);

      const tx = await tokenPool.removeLiquidity(removeLiquiditySymbol, ethers.utils.parseUnits(removeLiquidityAmount, 6));
      await tx.wait();
      alert('Liquidity removed successfully!');
      fetchData();
      setRemoveLiquiditySymbol('');
      setRemoveLiquidityAmount('');
    } catch (error) {
      console.error('Error removing liquidity:', error);
      alert('Failed to remove liquidity. Please try again.');
    }
  };

  if (isLoading || !isAdmin) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Pool Balances</h2>
          <ul>
            {poolBalances.map(({ symbol, balance }) => (
              <li key={symbol} className="mb-2">
                {symbol}: {balance}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Fee Management</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Base Fee (%)</label>
              <input
                type="text"
                value={baseFee}
                onChange={(e) => setBaseFee(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Discounted Fee (%)</label>
              <input
                type="text"
                value={discountedFee}
                onChange={(e) => setDiscountedFee(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleUpdateFees}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Update Fees
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Max Transaction Amount</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Max Amount (USDC/USDT)</label>
              <input
                type="text"
                value={maxTransactionAmount}
                onChange={(e) => setMaxTransactionAmount(e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <button
              onClick={handleUpdateMaxTransactionAmount}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Update Max Transaction Amount
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Manage Liquidity</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Add Liquidity</h3>
              <div className="space-y-2">
                <select
                  value={addLiquiditySymbol}
                  onChange={(e) => setAddLiquiditySymbol(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Token</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
                <input
                  type="text"
                  value={addLiquidityAmount}
                  onChange={(e) => setAddLiquidityAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleAddLiquidity}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                  Add Liquidity
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Remove Liquidity</h3>
              <div className="space-y-2">
                <select
                  value={removeLiquiditySymbol}
                  onChange={(e) => setRemoveLiquiditySymbol(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Token</option>
                  <option value="USDC">USDC</option>
                  <option value="USDT">USDT</option>
                </select>
                <input
                  type="text"
                  value={removeLiquidityAmount}
                  onChange={(e) => setRemoveLiquidityAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleRemoveLiquidity}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                  Remove Liquidity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

