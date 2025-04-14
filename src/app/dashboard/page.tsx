'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useDriftStore } from '@/store/driftStore';
import { PublicKey } from '@solana/web3.js';
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

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const router = useRouter();
  const { userAccounts, isLoading, error, fetchUserAccounts, setSelectedAccount } = useDriftStore();
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchWallet, setSearchWallet] = useState('');
  const [searchError, setSearchError] = useState('');
  
  // Fetch user accounts when wallet is connected or searched
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        if (searchWallet) {
          const pubKey = new PublicKey(searchWallet);
          await fetchUserAccounts(pubKey);
          setSearchError('');
        } else if (publicKey) {
          await fetchUserAccounts(publicKey);
        } else if (!connected && !searchWallet) {
          router.push('/');
        }
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setSearchError('Invalid wallet address');
      }
    };
    fetchAccounts();
  }, [publicKey, connected, fetchUserAccounts, router, searchWallet]);

  // Set the first account as selected by default when accounts are loaded
  useEffect(() => {
    if (userAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(userAccounts[0].subAccountId);
      setSelectedAccount(userAccounts[0]);
    }
  }, [userAccounts, selectedAccountId, setSelectedAccount]);

  // Get the currently selected account
  const selectedAccount = userAccounts.find(acc => acc.subAccountId === selectedAccountId);

  // Don't render anything while redirecting if not connected and no search
  if (!connected && !searchWallet) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-16rem)]">
      <div className="space-y-6 animate-fade-in flex-1">
        {/* Search Bar */}
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by wallet address..."
            value={searchWallet}
            onChange={(e) => setSearchWallet(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#1A1B23]/60 border border-[#3A3D4A]/60 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#ff7e5f]"
          />
          <button
            onClick={() => setSearchWallet('')}
            className="px-4 py-2 bg-[#2A2D3A]/60 text-white/70 rounded-lg hover:bg-[#3A3D4A]/60 transition-all"
          >
            Reset
          </button>
        </div>
        
        {/* Sub Account Selector */}
        {!isLoading && !error && userAccounts.length > 0 && (
          <div className="flex gap-4 items-center">
            <select
              value={selectedAccountId || ''}
              onChange={(e) => {
                const newId = parseInt(e.target.value);
                setSelectedAccountId(newId);
                const newAccount = userAccounts.find(acc => acc.subAccountId === newId);
                if (newAccount) setSelectedAccount(newAccount);
              }}
              className="flex-1 px-4 py-2 bg-[#1A1B23]/60 border border-[#3A3D4A]/60 rounded-lg text-white focus:outline-none focus:border-[#ff7e5f] appearance-none cursor-pointer"
            >
              {userAccounts.map((account) => (
                <option key={account.subAccountId} value={account.subAccountId}>
                  {account.name || `Account #${account.subAccountId}`} - {account.marginMode}
                </option>
              ))}
            </select>
            <div className="text-white/70">
              {userAccounts.length} {userAccounts.length === 1 ? 'Account' : 'Accounts'}
            </div>
          </div>
        )}
        
        {/* Search Error */}
        {searchError && (
          <div className="bg-[#ff5555]/10 border border-[#ff5555]/20 text-[#ff5555] rounded-xl p-4">
            {searchError}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff7e5f]"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-[#ff5555]/10 border border-[#ff5555]/20 text-[#ff5555] rounded-xl p-6">
            <p>{error}</p>
          </div>
        )}

        {/* No accounts state */}
        {!isLoading && !error && userAccounts.length === 0 && (
          <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 p-8 text-center shadow-lg">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-[#2A2D3A]/60 p-6 rounded-full mb-4">
                <svg
                  className="h-10 w-10 text-white/60"
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
              <h3 className="text-xl font-bold mb-2 text-white">No Accounts Found</h3>
              <p className="text-white/70 max-w-md mb-6">
                You don&apos;t have any Drift accounts associated with this wallet yet.
              </p>
              <button 
                className="px-5 py-2.5 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-black font-medium rounded-lg transition-all shadow-md"
              >
                <a 
                  href="https://app.drift.trade" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Create Account on Drift
                </a>
              </button>
            </div>
          </div>
        )}

        {/* Account details */}
        {!isLoading && !error && selectedAccount && (
          <div>
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {['overview', 'positions'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                    activeTab === tab
                      ? 'bg-[#ff7e5f] text-white'
                      : 'bg-[#1A1B23]/60 hover:bg-[#2A2D3A]/60 text-white'
                  } shadow-sm`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {/* Account Info Card */}
                <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 overflow-hidden hover:shadow-lg transition-all duration-200 shadow-md">
                  <div className="px-6 py-5 border-b border-[#3A3D4A]/60">
                    <h3 className="text-lg font-semibold text-white">Account Details</h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Account ID</span>
                        <span className="text-sm font-medium px-2.5 py-0.5 bg-[#ff7e5f]/10 text-[#ff7e5f] rounded-lg">
                          #{selectedAccount.subAccountId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Name</span>
                        <span className="text-sm font-medium text-white">{selectedAccount.name || 'Main Account'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Margin Mode</span>
                        <span className="text-sm font-medium text-white">{selectedAccount.marginMode}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Margin Trading</span>
                        {selectedAccount.isMarginTradingEnabled ? (
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-lg bg-[#4ade80] mr-2"></span>
                            <span className="text-sm font-medium text-white">Enabled</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-lg bg-[#ff5555] mr-2"></span>
                            <span className="text-sm font-medium text-white">Disabled</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Public Key</span>
                        <span className="text-xs text-white/70">
                          {selectedAccount.userAccountPublicKey.slice(0, 8)}...{selectedAccount.userAccountPublicKey.slice(-8)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Card */}
                <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 overflow-hidden hover:shadow-lg transition-all duration-200 shadow-md">
                  <div className="px-6 py-5 border-b border-[#3A3D4A]/60">
                    <h3 className="text-lg font-semibold text-white">Balance</h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Total Deposits</span>
                        <span className="text-sm font-medium text-white">${Number(selectedAccount.totalDeposits).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Total Withdraws</span>
                        <span className="text-sm font-medium text-white">${Number(selectedAccount.totalWithdraws).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Settled PnL</span>
                        <span className={`text-sm font-medium ${Number(selectedAccount.settledPerpPnl) >= 0 ? 'text-[#4ade80]' : 'text-[#ff5555]'}`}>
                          ${Number(selectedAccount.settledPerpPnl).toLocaleString()}
                        </span>
                      </div>
                      <div className="py-2 px-4 bg-[#2A2D3A]/60 rounded-lg mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-white/70">Net Balance</span>
                          <span className="text-sm font-bold text-white">
                            ${(Number(selectedAccount.totalDeposits) - Number(selectedAccount.totalWithdraws) + Number(selectedAccount.settledPerpPnl)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Card */}
                <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 overflow-hidden hover:shadow-lg transition-all duration-200 shadow-md">
                  <div className="px-6 py-5 border-b border-[#3A3D4A]/60">
                    <h3 className="text-lg font-semibold text-white">Activity</h3>
                  </div>
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Open Orders</span>
                        <span className="text-sm font-medium text-white">{selectedAccount.openOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Has Open Orders</span>
                        {selectedAccount.hasOpenOrder ? (
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-lg bg-[#4ade80] mr-2"></span>
                            <span className="text-sm font-medium text-white">Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="h-2 w-2 rounded-lg bg-[#ff5555] mr-2"></span>
                            <span className="text-sm font-medium text-white">No</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-white/70">Last Active</span>
                        <span className="text-sm font-medium text-white">Slot {selectedAccount.lastActiveSlot}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Positions Tab */}
            {activeTab === 'positions' && (
              <div className="space-y-6">
                {((selectedAccount.spotPositions && selectedAccount.spotPositions.some(isValidSpotPosition)) || 
                  (selectedAccount.perpPositions && selectedAccount.perpPositions.some(isValidPerpPosition))) ? (
                  <div className="space-y-6">
                    {/* Spot Positions Card */}
                    {selectedAccount.spotPositions && selectedAccount.spotPositions.some(isValidSpotPosition) && (
                      <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#3A3D4A]/60">
                          <h3 className="text-lg font-semibold text-white">Spot Positions</h3>
                        </div>
                        <div className="px-6 py-4">
                          <div className="overflow-x-auto -mx-6">
                            <table className="min-w-full divide-y divide-border">
                              <thead className="bg-[#2A2D3A]/60">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Token</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Scaled Balance</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Market Index</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Open Orders</th>
                                </tr>
                              </thead>
                              <tbody className="bg-transparent divide-y divide-[#3A3D4A]">
                                {selectedAccount.spotPositions
                                  .filter(isValidSpotPosition)
                                  .map((position, index) => (
                                  <tr key={index} className="hover:bg-[#2A2D3A]/90 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{position!.market}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position!.scaledBalance}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position!.marketIndex}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position!.openOrders}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Perp Positions Card */}
                    {selectedAccount.perpPositions && selectedAccount.perpPositions.some(isValidPerpPosition) && (
                      <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 overflow-hidden">
                        <div className="px-6 py-5 border-b border-[#3A3D4A]/60">
                          <h3 className="text-lg font-semibold text-white">Perpetual Positions</h3>
                        </div>
                        <div className="px-6 py-4">
                          <div className="overflow-x-auto -mx-6">
                            <table className="min-w-full divide-y divide-border">
                              <thead className="bg-[#2A2D3A]/60">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Market</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Base Asset</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Quote Asset</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Settled PnL</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Open Orders</th>
                                </tr>
                              </thead>
                              <tbody className="bg-transparent divide-y divide-[#3A3D4A]">
                                {selectedAccount.perpPositions
                                  .filter(isValidPerpPosition)
                                  .map((position, index) => (
                                  <tr key={index} className="hover:bg-[#2A2D3A]/90 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{position!.market}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position!.baseAssetAmount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position!.quoteAssetAmount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position!.settledPnl}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{position!.openOrders}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 p-12 text-center shadow-lg">
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="bg-[#2A2D3A]/60 p-6 rounded-full mb-4">
                        <svg
                          className="h-10 w-10 text-white/60"
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
                      <h3 className="text-xl font-bold mb-2 text-white">No Open Positions</h3>
                      <p className="text-white/70 max-w-md mb-6">
                        You don&apos;t have any open positions with this account yet.
                      </p>
                      <button 
                        className="px-5 py-2.5 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-black font-medium rounded-lg transition-all shadow-md"
                      >
                        <a 
                          href="https://app.drift.trade/SOL-PERP" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          Start Trading
                        </a>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-[#1A1B23]/60 backdrop-blur-md rounded-xl border border-[#3A3D4A]/60 p-12 text-center shadow-lg">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="bg-[#2A2D3A]/60 p-6 rounded-full mb-4">
                    <svg
                      className="h-10 w-10 text-white/60"
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
                  <h3 className="text-xl font-bold mb-2 text-white">No Open Orders</h3>
                  <p className="text-white/70 max-w-md mb-6">
                    You don&apos;t have any open orders with this account yet.
                  </p>
                  <button 
                    className="px-5 py-2.5 bg-gradient-to-r from-[#ff7e5f] to-[#feb47b] hover:opacity-90 text-black font-medium rounded-lg transition-all shadow-md"
                  >
                    <a 
                      href="https://app.drift.trade/SOL-PERP" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      Create an Order
                    </a>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 