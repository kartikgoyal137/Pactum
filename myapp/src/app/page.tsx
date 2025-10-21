
'use client';

import { useAccount, useReadContracts } from 'wagmi';
import { escrowFactoryAbi } from '../lib/abis';
import { EscrowCard } from '../components/EscrowCard';
import { useMemo } from 'react';

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const factoryAddress = "0xa7aC5c00454B2f2a3b5F295FBB362975A841d15a";

  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: factoryAddress,
        abi: escrowFactoryAbi,
        functionName: 'getClientContracts',
        args: [address!],
      },
      {
        address: factoryAddress,
        abi: escrowFactoryAbi,
        functionName: 'getFreelancerContracts',
        args: [address!],
      },
    ],
    query: {
      enabled: isConnected,
    },
  });


  const { clientContracts, freelancerContracts } = useMemo(() => {
    if (!data) return { clientContracts: [], freelancerContracts: [] };

    const clientResult = data[0]?.status === 'success' ? data[0].result : [];
    const freelancerResult = data[1]?.status === 'success' ? data[1].result : [];

    return {
      clientContracts: clientResult as readonly `0x${string}`[],
      freelancerContracts: freelancerResult as readonly `0x${string}`[],
    };
  }, [data]);

  if (!isConnected) {
    return <div>Please connect your wallet to view your dashboard.</div>;
  }

  return (
    <div>
      <h1>Your Dashboard</h1>
      {isLoading && <p>Loading your contracts...</p>}

      {!isLoading && (
        <>
          <section>
            <h2>As Client</h2>
            {clientContracts.length === 0 && <p>You have no contracts as a client.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {clientContracts.map((contractAddress) => (
                <EscrowCard
                  key={contractAddress}
                  contractAddress={contractAddress}
                  role="client"
                />
              ))}
            </div>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h2>As Freelancer</h2>
            {freelancerContracts.length === 0 && <p>You have no contracts as a freelancer.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {freelancerContracts.map((contractAddress) => (
                <EscrowCard
                  key={contractAddress}
                  contractAddress={contractAddress}
                  role="freelancer"
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}