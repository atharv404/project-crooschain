import React from 'react';

interface FeeDisplayProps {
  fee: string;
}

export const FeeDisplay: React.FC<FeeDisplayProps> = ({ fee }) => {
  return (
    <div className="text-sm text-gray-300">
      <p>Fee: {fee}%</p>
    </div>
  );
};

