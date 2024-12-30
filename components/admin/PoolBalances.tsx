import React from 'react';

interface PoolBalancesProps {
  poolBalances: { symbol: string; balance: string }[];
}

export const PoolBalances: React.FC<PoolBalancesProps> = ({ poolBalances }) => {
  return (
    <div className="bg-[#212121] p-6 rounded-xl">
      <h2 className="text-2xl font-semibold mb-4">Pool Balances</h2>
      <ul>
        {poolBalances.map(({ symbol, balance }) => (
          <li key={symbol} className="mb-2">
            {symbol}: {balance}
          </li>
        ))}
      </ul>
    </div>
  );
};

