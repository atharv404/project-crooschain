import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenPool__factory, FeeManager__factory } from '../../typechain-types';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import { PoolBalances } from '../../components/admin/PoolBalances';
import { FeeManagement } from '../../components/admin/FeeManagement';
import { MaxTransactionAmount } from '../../components/admin/MaxTransactionAmount';
import { LiquidityManagement } from '../../components/admin/LiquidityManagement';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { isAdmin, isLoading } = useAuth();

  const [poolBalances, setPoolBalances] = useState<{ symbol: string; balance: string }[]>([]);
  const [baseFee, setBaseFee] = useState('');
  const [discountedFee, setDiscountedFee] = useState('');
  const [maxTransactionAmount, setMaxTransactionAmount] = useState('');

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

  if (isLoading || !isAdmin) {
    return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-[#5C67FF]">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PoolBalances poolBalances={poolBalances} />
        <FeeManagement
          baseFee={baseFee}
          discountedFee={discountedFee}
          setBaseFee={setBaseFee}
          setDiscountedFee={setDiscountedFee}
          onUpdate={fetchData}
        />
        <MaxTransactionAmount
          maxTransactionAmount={maxTransactionAmount}
          setMaxTransactionAmount={setMaxTransactionAmount}
          onUpdate={fetchData}
        />
        <LiquidityManagement onUpdate={fetchData} />
      </div>
    </div>
  );
};

export default AdminDashboard;

