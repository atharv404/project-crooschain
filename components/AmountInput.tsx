import React from 'react';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <label className="block mb-2 text-sm font-medium">Amount</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded text-white"
        placeholder="Enter amount"
      />
    </div>
  );
};

