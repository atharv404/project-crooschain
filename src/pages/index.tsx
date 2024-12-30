import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { TokenPool__factory } from '../typechain-types';

const Home: React.FC = () => {
  const [sourceChain, setSourceChain] = useState('');
  const [destinationChain, setDestinationChain] = useState('');
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [fee, setFee] = useState('0');

  useEffect(() => {
    // Fetch fee from API
    const fetchFee = async () => {
      const response = await fetch('/api/fees');
      const data = await response.json();
      setFee(data.baseFee.toString());
    };
    fetchFee();
  }, []);

  const handleSwap = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenPoolAddress = process.env.NEXT_PUBLIC_TOKEN_POOL_ADDRESS!;
      const tokenPool = TokenPool__factory.connect(tokenPoolAddress, signer);

      const tx = await tokenPool.initiateSwap(token, ethers.utils.parseUnits(amount, 6), parseInt(destinationChain), recipient);
      await tx.wait();
      alert('Swap initiated successfully!');
    } catch (error) {
      console.error('Error initiating swap:', error);
      alert('Failed to initiate swap. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cross-Chain Swap</h1>
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Source Chain</label>
          <select
            value={sourceChain}
            onChange={(e) => setSourceChain(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Source Chain</option>
            <option value="1">Ethereum</option>
            <option value="56">Binance Smart Chain</option>
            <option value="137">Polygon</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Destination Chain</label>
          <select
            value={destinationChain}
            onChange={(e) => setDestinationChain(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Destination Chain</option>
            <option value="1">Ethereum</option>
            <option value="56">Binance Smart Chain</option>
            <option value="137">Polygon</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Token</label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Token</option>
            <option value="USDC">USDC</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label className="block mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter recipient address"
          />
        </div>
        <div>
          <p>Fee: {fee}%</p>
        </div>
        <button
          onClick={handleSwap}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Initiate Swap
        </button>
      </div>
    </div>
  );
};

export default Home;

