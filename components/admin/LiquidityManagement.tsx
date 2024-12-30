import React, { useState } from 'react';
import { ethers } from 'ethers';
import { TokenPool__factory } from '../../typechain-types';

interface LiquidityManagementProps {
  onUpdate: () => void;
}

export const LiquidityManagement: React.FC<LiquidityManagementProps> = ({ onUpdate }) => {
  const [addLiquiditySymbol, setAddLiquiditySymbol] = useState('');
  const [addLiquidityAmount, setAddLiquidityAmount] = useState('');
  const [removeLiquiditySymbol, setRemoveLiquiditySymbol] = useState('');
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState('');

  const handleAddLiquidity = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenPoolAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_ADDRESS!;
      const tokenPool = TokenPool__factory.connect(tokenPoolAddress, signer);

      const tx = await tokenPool.addLiquidity(addLiquiditySymbol, ethers.utils.parseUnits(addLiquidityAmount, 6));
      await tx.wait();
      alert('Liquidity added successfully!');
      onUpdate();
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
      onUpdate();
      setRemoveLiquiditySymbol('');
      setRemoveLiquidityAmount('');
    } catch (error) {
      console.error('Error removing liquidity:', error);
      alert('Failed to remove liquidity. Please try again.');
    }
  };

  return (
    <div className="bg-[#212121] p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Manage Liquidity</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Add Liquidity</h3>
          <div className="space-y-2">
            <select
              value={addLiquiditySymbol}
              onChange={(e) => setAddLiquiditySymbol(e.target.value)}
              className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
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
              className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
            />
            <button
              onClick={handleAddLiquidity}
              className="bg-[#5C67FF] text-white p-2 rounded hover:bg-[#4A55FF] transition-colors duration-200"
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
              className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
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
              className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
            />
            <button
              onClick={handleRemoveLiquidity}
              className="bg-[#5C67FF] text-white p-2 rounded hover:bg-[#4A55FF] transition-colors duration-200"
            >
              Remove Liquidity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

