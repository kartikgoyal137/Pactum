// app/components/EscrowCard.tsx
'use client';

import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { escrowAbi } from '../lib/abis';
import { formatEther } from 'viem';
import { useEffect, useMemo } from 'react'; 

const contractStatuses = [
  'Awaiting Deposit', // 0
  'In Progress',      // 1
  'Complete',         // 2
  'In Dispute',       // 3
  'Cancelled',        // 4
];

interface EscrowCardProps {
  contractAddress: `0x${string}`;
  role: 'client' | 'freelancer';
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '1rem',
  backgroundColor: '#1a1a1a',
};
const buttonGroupStyle: React.CSSProperties = {
  marginTop: '1rem',
  display: 'flex',
  gap: '0.5rem',
};

export function EscrowCard({ contractAddress, role }: EscrowCardProps) {
  const { address } = useAccount();

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  const { data, refetch, isLoading: isDataLoading } = useReadContracts({
    contracts: [
      { address: contractAddress, abi: escrowAbi, functionName: 'state' },
      { address: contractAddress, abi: escrowAbi, functionName: 'getAmount' },
      { address: contractAddress, abi: escrowAbi, functionName: 'getClient' },
      { address: contractAddress, abi: escrowAbi, functionName: 'getFreelancer' },
    ],
  });

  const { state, amount, client, freelancer } = useMemo(() => {
    return {
      state: data?.[0].result as number | undefined,
      amount: data?.[1].result as bigint | undefined,
      client: data?.[2].result as `0x${string}` | undefined,
      freelancer: data?.[3].result as `0x${string}` | undefined,
    }
  }, [data]);

  useEffect(() => {
    if (isConfirmed) {
      refetch(); 
    }
  }, [isConfirmed, refetch]);


  const handleDeposit = () => {
    if (!amount) return;
    writeContract({ address: contractAddress, abi: escrowAbi, functionName: 'deposit', value: amount, chainId: 300 });
  };

  const handleApprove = () => {
    writeContract({ address: contractAddress, abi: escrowAbi, functionName: 'approve', chainId: 300, });
  };

  const handleRaiseDispute = () => {
    writeContract({ address: contractAddress, abi: escrowAbi, functionName: 'raiseDispute', chainId: 300, });
  };


  const statusString = typeof state === 'number' ? contractStatuses[state] : 'Loading...';
  const amountString = typeof amount === 'bigint' ? `${formatEther(amount)} ETH` : 'Loading...';
  const showDeposit = role === 'client' && state === 0; 
  const showApprove = role === 'client' && state === 1; 
  const showDispute = state === 1;

  if (isDataLoading) {
    return <div style={cardStyle}>Loading contract details...</div>;
  }

  return (
    <div style={cardStyle}>
      <p><strong>Contract:</strong> {contractAddress}</p>
      <p><strong>Status:</strong> {statusString}</p>
      <p><strong>Amount:</strong> {amountString}</p>
      {role === 'client' && <p><strong>Freelancer:</strong> {freelancer}</p>}
      {role === 'freelancer' && <p><strong>Client:</strong> {client}</p>}
      
      <div style={buttonGroupStyle}>
        {showDeposit && (
          <button onClick={handleDeposit} disabled={isPending}>
            {isPending ? 'Depositing...' : `Deposit ${amountString}`}
          </button>
        )}
        
        {showApprove && (
          <button onClick={handleApprove} disabled={isPending}>
            {isPending ? 'Approving...' : 'Approve & Release Funds'}
          </button>
        )}
        
        {showDispute && (
          <button onClick={handleRaiseDispute} disabled={isPending} style={{ backgroundColor: '#dc3545' }}>
            {isPending ? 'Raising...' : 'Raise Dispute'}
          </button>
        )}
      </div>

      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction successful! State updated.</div>}
      {error && <div style={{ color: 'red', marginTop: '0.5rem' }}>Error: {error.message}</div>}
    </div>
  );
}