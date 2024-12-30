import React from 'react';

interface SwapButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const SwapButton: React.FC<SwapButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="w-full bg-[#5C67FF] text-white p-3 rounded-lg font-semibold hover:bg-[#4A55FF] transition-colors duration-200 disabled:opacity-50"
    >
      {isLoading ? 'Swapping...' : 'Initiate Swap'}
    </button>
  );
};

