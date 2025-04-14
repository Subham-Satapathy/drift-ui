'use client';

import { useDriftStore } from '@/store/driftStore';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

// Import types from Drift Store
import type { SpotPosition, PerpPosition } from '@/store/driftStore';

// Helper functions to check for valid positions
const isValidSpotPosition = (position: SpotPosition | null | undefined): boolean => {
  if (!position) return false;
  return position.scaledBalance !== "00" && !!position.scaledBalance;
};

const isValidPerpPosition = (position: PerpPosition | null | undefined): boolean => {
  if (!position) return false;
  return (position.baseAssetAmount !== "00" && !!position.baseAssetAmount) || 
         (position.quoteAssetAmount !== "00" && !!position.quoteAssetAmount) || 
         (position.settledPnl !== "00" && !!position.settledPnl);
};

// Define the type for the account prop
type AccountProps = {
  account: {
    userAccountPublicKey: string;
    subAccountId: number;
    name: string;
    marginMode: string;
    isMarginTradingEnabled: boolean;
    totalDeposits: string | number;
    totalWithdraws: string | number;
    settledPerpPnl: string | number;
    openOrders: string | number;
    lastActiveSlot: string | number;
    spotPositions?: (SpotPosition | null)[];
    perpPositions?: (PerpPosition | null)[];
  };
};

// Single account component that manages its own tab state
function UserAccount({ account }: AccountProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div 
      className="bg-card backdrop-blur-sm overflow-hidden rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="px-6 py-5 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center">
              <h3 className="text-xl font-semibold">{account.name || `Account #${account.subAccountId}`}</h3>
              <span className="ml-2 px-2.5 py-0.5 bg-primary/10 text-primary rounded-lg text-xs font-medium">
                #{account.subAccountId}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted truncate max-w-xs sm:max-w-md">
              {account.userAccountPublicKey}
            </p>
          </div>
          <div className="flex gap-2">
            {['overview', 'positions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium text-foreground ${
                  activeTab === tab
                    ? 'border-1 border-primary'
                    : 'border border-transparent'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {activeTab === 'overview' && (
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Account Details',
                items: [
                  ['Margin Mode', account.marginMode],
                  ['Margin Trading', account.isMarginTradingEnabled ? (
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-lg bg-success mr-2"></span>
                      <span>Enabled</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-lg bg-danger mr-2"></span>
                      <span>Disabled</span>
                    </div>
                  )],
                ],
              },
              {
                title: 'Balance',
                items: [
                  ['Total Deposits', `$${account.totalDeposits}`],
                  ['Total Withdraws', `$${account.totalWithdraws}`],
                  ['Settled PnL', `$${account.settledPerpPnl}`],
                ],
              },
              {
                title: 'Activity',
                items: [
                  ['Open Orders', account.openOrders],
                ],
              },
            ].map((section, idx) => (
              <div key={idx} className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border hover:shadow-sm transition-all duration-200">
                <dt className="text-sm font-medium text-muted">{section.title}</dt>
                <dd className="mt-4 space-y-3">
                  {section.items.map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between items-center">
                      <span className="text-sm text-muted">{label}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {activeTab === 'positions' && (
          <div>
            {((account.spotPositions && account.spotPositions.some(isValidSpotPosition)) || 
              (account.perpPositions && account.perpPositions.some(isValidPerpPosition))) ? (
              <div className="space-y-6">
                {account.spotPositions && account.spotPositions.some(isValidSpotPosition) && (
                  <div>
                    <h4 className="text-lg font-medium mb-4">Spot Positions</h4>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-card/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Token</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Scaled Balance</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {account.spotPositions
                            .filter(isValidSpotPosition)
                            .map((position, index) => (
                            <tr key={index} className="hover:bg-card/80 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{position!.market}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{position!.scaledBalance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {account.perpPositions && account.perpPositions.some(isValidPerpPosition) && (
                  <div>
                    <h4 className="text-lg font-medium mb-4">Perpetual Positions</h4>
                    <div className="overflow-x-auto rounded-xl border border-border">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-card/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Token</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Settled PnL</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {account.perpPositions
                            .filter(isValidPerpPosition)
                            .map((position, index) => (
                            <tr key={index} className="hover:bg-card/80 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{position!.market}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{position!.baseAssetAmount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">{position!.settledPnl}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-card/50 p-4 rounded-lg mb-3">
                  <svg
                    className="h-8 w-8 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-muted">No open positions</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-card/50 p-4 rounded-lg mb-3">
              <svg
                className="h-8 w-8 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm text-muted">No open orders</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserAccounts() {
  const { publicKey, connected } = useWallet();
  const { userAccounts, isLoading, error, fetchUserAccounts } = useDriftStore();

  useEffect(() => {
    if (publicKey) {
      fetchUserAccounts(publicKey);
    }
  }, [publicKey, fetchUserAccounts]);

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border animate-fade-in">
        <div className="bg-card/50 p-4 rounded-lg mb-4">
          <svg
            className="h-8 w-8 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No wallet connected</h3>
        <p className="mt-2 text-center text-muted">Connect your wallet using the button above to view your accounts</p>
        <button 
          onClick={() => document.querySelector('.wallet-adapter-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}
          className="mt-6 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="5" width="20" height="14" rx="2" />
            <path d="M16 14V8a2 2 0 10-4 0v6" />
            <path d="M20 10h1a1 1 0 011 1v2a1 1 0 01-1 1h-1" />
          </svg>
          Connect Wallet
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-6 w-full max-w-3xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-8 w-8 bg-primary/20 rounded-lg animate-pulse"></div>
            <div>
              <div className="h-5 bg-card/80 rounded w-32 animate-pulse"></div>
              <div className="h-3 mt-2 bg-card/60 rounded w-48 animate-pulse"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-card/50 rounded-xl p-6 border border-border/50">
                <div className="h-4 bg-card/80 rounded w-24 mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-3 bg-card/60 rounded w-20 animate-pulse"></div>
                    <div className="h-3 bg-card/70 rounded w-16 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-card/60 rounded w-24 animate-pulse"></div>
                    <div className="h-3 bg-card/70 rounded w-12 animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-card/60 rounded w-16 animate-pulse"></div>
                    <div className="h-3 bg-card/70 rounded w-20 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-danger/10 p-6 border border-danger/20 animate-fade-in">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 bg-danger/20 p-1.5 rounded-lg">
            <svg className="h-5 w-5 text-danger" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-medium text-danger">Error loading accounts</h3>
            <p className="mt-2 text-sm text-foreground/80">{error}</p>
            <div className="mt-4">
              <button 
                onClick={() => publicKey && fetchUserAccounts(publicKey)}
                className="flex items-center text-sm font-medium text-danger bg-danger/10 hover:bg-danger/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                  <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"></path>
                  <path d="M17 12a5 5 0 0 0-10 0"></path>
                  <line x1="12" y1="7" x2="12" y2="12"></line>
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userAccounts.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-card/50 backdrop-blur-sm rounded-xl p-8 border border-border animate-fade-in">
        <div className="bg-card/50 p-4 rounded-lg mb-4">
          <svg
            className="h-8 w-8 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">No accounts found</h3>
        <p className="mt-2 text-center text-muted">Get started by creating a new account</p>
        <button className="mt-6 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {userAccounts.map((account) => (
        <UserAccount key={account.userAccountPublicKey} account={account} />
      ))}
    </div>
  );
} 