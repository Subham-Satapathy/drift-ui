'use client';

import UserAccounts from '@/components/UserAccounts';
import { useState } from 'react';
import WalletLookup from '@/components/WalletLookup';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Page header with actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted">Monitor your Drift Protocol positions and accounts</p>
        </div>
        
        <button
          onClick={() => setIsLookupOpen(!isLookupOpen)}
          className={`px-4 py-2.5 rounded-lg text-sm text-white font-medium transition-all 
            ${isLookupOpen 
              ? 'bg-primary/10 text-primary border-black border' 
              : 'bg-primary text-black shadow-sm hover:border-primary/20 border'}`}
        >
          Check other wallet
        </button>
      </div>

      {/* Wallet lookup section */}
      {isLookupOpen && (
        <div className="bg-card animate-slide-up rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wallet Lookup</h2>
            <button 
              onClick={() => setIsLookupOpen(false)}
              className="text-muted hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-6">
            <WalletLookup />
          </div>
        </div>
      )}

      {/* User accounts section */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">Your Accounts</h2>
        </div>
        <div className="p-6">
          <UserAccounts />
        </div>
      </div>
    </div>
  );
}
