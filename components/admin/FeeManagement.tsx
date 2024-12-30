import React from 'react';
import { ethers } from 'ethers';
import { FeeManager__factory } from '../../typechain-types';

interface FeeManagementProps {
  baseFee: string;
  discountedFee: string;
  setBaseFee: (value: string) => void;
  setDiscountedFee: (value: string) => void;
  onUpdate: () => void;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
  baseFee,
  discountedFee,
  setBaseFee,
  setDiscountedFee,
  onUpdate,
}) => {
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
      onUpdate();
    } catch (error) {
      console.error('Error updating fees:', error);
      alert('Failed to update fees. Please try again.');
    }
  };

  return (
    <div className="bg-[#212121] p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Fee Management</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Base Fee (%)</label>
          <input
            type="text"
            value={baseFee}
            onChange={(e) => setBaseFee(e.target.value)}
            className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
          />
        </div>
        <div>
          <label className="block mb-2">Discounted Fee (%)</label>
          <input
            type="text"
            value={discountedFee}
            onChange={(e) => setDiscountedFee(e.target.value)}
            className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
          />
        </div>
        <button
          onClick={handleUpdateFees}
          className="bg-[#5C67FF] text-white p-2 rounded hover:bg-[#4A55FF] transition-colors duration-200"
        >
          Update Fees
        </button>
      </div>
    </div>
  );
};

