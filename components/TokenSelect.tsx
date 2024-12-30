import React from 'react';

interface TokenSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const TokenSelect: React.FC<TokenSelectProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Token</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
      >
        <option value="">Select Token</option>
        <option value="USDC">USDC</option>
        <option value="USDT">USDT</option>
      </select>
    </div>
  );
};

