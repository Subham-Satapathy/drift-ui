'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import wallet button with ssr disabled
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export const Header = () => {
  const { connected, publicKey, wallet } = useWallet();
  const { setWalletConnected, setWalletAddress, setWalletName } = useStore();
  
  useEffect(() => {
    setWalletConnected(connected);
    setWalletAddress(publicKey?.toBase58() || null);
    setWalletName(wallet?.adapter.name || null);
  }, [connected, publicKey, wallet, setWalletConnected, setWalletAddress, setWalletName]);
  
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/90 border-b border-border py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-[80px] h-[40px] sm:w-[120px] sm:h-[60px] relative">
              <Image 
                src="/logo.png" 
                alt="Drift Logo" 
                fill 
                className="object-contain" 
                priority 
              />
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}; 