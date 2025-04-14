import { useDriftStore } from '@/store/driftStore';
import { PublicKey } from '@solana/web3.js';
import { useState } from 'react';

export default function WalletLookup() {
  const { selectedAccount, fetchUserAccounts, isLoading, userAccounts } = useDriftStore();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!inputValue.trim()) {
        setError('Please enter a wallet address');
        return;
      }
      
      // Validate Solana public key
      try {
        new PublicKey(inputValue);
      } catch {
        setError('Invalid Solana address format');
        return;
      }
      
      await fetchUserAccounts(new PublicKey(inputValue));
    } catch (err) {
      setError((err as Error).message || 'Failed to lookup wallet');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                <path d="M20 7h-7.5M14 7V5"></path>
                <path d="M9 11V9"></path>
                <path d="M16 11h4"></path>
                <path d="M11 15H6"></path>
                <path d="M16 19h4"></path>
                <path d="M13 19v-4"></path>
                <rect x="4" y="3" width="16" height="16" rx="2"></rect>
              </svg>
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter Solana wallet address"
              className="pl-10 w-full px-4 py-2.5 rounded-lg border border-border bg-card/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-black border border-black rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor"></path>
              </svg>
            ) : null}
            Check
          </button>
        </div>
        {error && (
          <div className="mt-2 text-sm text-danger">{error}</div>
        )}
      </form>

      {userAccounts.length === 0 && !isLoading && inputValue && !error && (
        <div className="p-4 border border-border rounded-lg bg-card/50">
          <p className="text-muted text-sm">No accounts found for this address. This wallet may not have any Drift accounts yet.</p>
        </div>
      )}

      {selectedAccount && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center">
                <h3 className="text-xl font-semibold">Account #{selectedAccount.userIndex}</h3>
                <span className="ml-2 px-2.5 py-0.5 bg-secondary/10 text-secondary rounded-lg text-xs font-medium">
                  {selectedAccount.name || 'Unnamed'}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted truncate max-w-xs sm:max-w-md">
                {selectedAccount.userAccountPublicKey}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-foreground border-2 border-primary">Overview</button>
              <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-foreground border border-transparent">Positions</button>
              <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-foreground border border-transparent">Orders</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 