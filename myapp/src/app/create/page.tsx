'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { escrowFactoryAbi } from '../../lib/abis';

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  maxWidth: '400px',
};

export default function CreateAgreement() {
  const factoryAddress = "0xa7aC5c00454B2f2a3b5F295FBB362975A841d15a";
  const [freelancer, setFreelancer] = useState('');
  const [arbiter, setArbiter] = useState('');
  const [amount, setAmount] = useState('');
  
  const { address: clientAddress, isConnected } = useAccount();
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientAddress) {
      alert('Please connect your wallet');
      return;
    }

    const parsedAmount = parseEther(amount as `${number}`);

    writeContract({
      address: factoryAddress,
      abi: escrowFactoryAbi,
      functionName: 'createContract',
      args: [
        arbiter as `0x${string}`,
        clientAddress as `0x${string}`, 
        freelancer as `0x${string}`,
        parsedAmount,
      ],
      chainId: 300,
    });

    setFreelancer(''); setArbiter(''); setAmount('');
  };

  return (
    <div>
      <h1>Create New Escrow Agreement</h1>
      <p>
        You are creating this agreement as the <strong>Client</strong>.
      </p>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="freelancer">Freelancer Address</label>
          <input
            id="freelancer"
            type="text"
            value={freelancer}
            onChange={(e) => setFreelancer(e.target.value)}
            placeholder="0x..."
            required
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label htmlFor="arbiter">Arbiter Address</label>
          <input
            id="arbiter"
            type="text"
            value={arbiter}
            onChange={(e) => setArbiter(e.target.value)}
            placeholder="0x..."
            required
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label htmlFor="amount">Amount (in ETH)</label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 1.5"
            required
            style={{ width: '100%' }}
          />
        </div>
        
        <button type="submit" disabled={isPending || !isConnected}>
          {isPending ? 'Creating...' : 'Create Contract'}
        </button>
      </form>

      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed! Contract created.</div>}
      {error && (
        <div>Error: {error.message}</div>
      )}
    </div>
  );
}