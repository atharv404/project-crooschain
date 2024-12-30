import React from 'react';
import { ethers } from 'ethers';
import { TokenPool__factory } from '../../typechain-types';

interface MaxTransactionAmountProps {
  maxTransactionAmount: string;
  setMaxTransactionAmount: (value: string) => void;
  onUpdate: () => void;
}

export const MaxTransactionAmount: React.FC<MaxTransactionAmountProps> = ({
  maxTransactionAmount,
  setMaxTransactionAmount,
  onUpdate,
}) => {
  const handleUpdateMaxTransactionAmount = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenPoolAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_ADDRESS!;
      const tokenPool = TokenPool__factory.connect(tokenPoolAddress, signer);

      const tx = await tokenPool.setMaxTransactionAmount(ethers.utils.parseUnits(maxTransactionAmount, 6));
      await tx.wait();
      alert('Max transaction amount updated successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error updating max transaction amount:', error);
      alert('Failed to update max transaction amount. Please try again.');
    }
  };

  return (
    <div className="bg-[#212121] p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Max Transaction Amount</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Max Amount (USDC/USDT)</label>
          <input
            type="text"
            value={maxTransactionAmount}
            onChange={(e) => setMaxTransactionAmount(e.target.value)}
            className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
          />
        </div>
        <button
          onClick={handleUpdateMaxTransactionAmount}
          className="bg-[#5C67FF] text-white p-2 rounded hover:bg-[#4A55FF] transition-colors duration-200"
        >
          Update Max Transaction Amount
        </button>
      </div>
    </div>
  );
};

