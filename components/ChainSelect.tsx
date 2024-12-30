import React from 'react';

interface ChainSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const ChainSelect: React.FC<ChainSelectProps> = ({ label, value, onChange }) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
      >
        <option value="">Select Chain</option>
        <option value="1">Ethereum</option>
        <option value="56">Binance Smart Chain</option>
        <option value="137">Polygon</option>
      </select>
    </div>
  );
};

