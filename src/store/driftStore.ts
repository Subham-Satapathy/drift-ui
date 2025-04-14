import { create } from 'zustand';
import { DriftClient } from '@drift-labs/sdk';
import { PublicKey } from '@solana/web3.js';

export interface SpotPosition {
  scaledBalance: string;
  openBids: string;
  openAsks: string;
  cumulativeDeposits: string;
  marketIndex: number;
  market: string;
  balanceType: {
    deposit?: Record<string, unknown>;
    borrow?: Record<string, unknown>;
  };
  openOrders: number;
  padding: number[];
}

export interface PerpPosition {
  lastCumulativeFundingRate: string;
  baseAssetAmount: string;
  quoteAssetAmount: string;
  quoteBreakEvenAmount: string;
  quoteEntryAmount: string;
  openBids: string;
  openAsks: string;
  settledPnl: string;
  lpShares: string;
  lastBaseAssetAmountPerLp: string;
  lastQuoteAssetAmountPerLp: string;
  remainderBaseAssetAmount: number;
  marketIndex: number;
  openOrders: number;
  perLpBase: number;
  market: string;
}

interface DriftUserAccount {
  userAccountPublicKey: string;
  userIndex: string;
  name: string;
  authority: string;
  subAccountId: number;
  delegate: string | null;
  totalDeposits: string;
  totalWithdraws: string;
  settledPerpPnl: string;
  lastActiveSlot: string;
  openOrders: number;
  hasOpenOrder: boolean;
  isMarginTradingEnabled: boolean;
  marginMode: string;
  spotPositions?: SpotPosition[];
  perpPositions?: PerpPosition[];
}

interface DriftAPIAccount {
  publicKey?: string;
  name?: number[];
  userIndex?: number;
  authority?: string;
  subAccountId?: number;
  delegate?: string;
  lastActiveSlot?: number;
  settledPerpPnl?: number;
  totalDeposits?: number;
  totalWithdraws?: number;
  openOrders?: number;
  hasOpenOrder?: boolean;
  isMarginTradingEnabled?: boolean;
  marginMode?: {
    default?: boolean;
  };
  spotPositions?: SpotPosition[];
  perpPositions?: PerpPosition[];
}

interface DriftStore {
  driftClient: DriftClient | null;
  userAccounts: DriftUserAccount[];
  selectedAccount: DriftUserAccount | null;
  isLoading: boolean;
  error: string | null;
  setDriftClient: (client: DriftClient) => void;
  setUserAccounts: (accounts: DriftUserAccount[]) => void;
  setSelectedAccount: (account: DriftUserAccount | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchUserAccounts: (authorityPublicKey: PublicKey) => Promise<void>;
}

export const useDriftStore = create<DriftStore>((set) => ({
  driftClient: null,
  userAccounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,
  setDriftClient: (client) => set({ driftClient: client }),
  setUserAccounts: (accounts) => set({ userAccounts: accounts }),
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  fetchUserAccounts: async (authorityPublicKey) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/drift/user-accounts?publicKey=${authorityPublicKey.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch user accounts');
      }

      if(data.data.length === 0){
        set({ userAccounts: [] });
        return;
      }
      
      const transformedAccounts = data.data.map((account: DriftAPIAccount) => {
        const name = account?.name 
          ? String.fromCharCode(...account.name.filter(n => n !== 0))
          : 'Main Account';
          
        return {
          userAccountPublicKey: account.publicKey || authorityPublicKey.toString(),
          userIndex: account?.userIndex?.toString() || '0',
          name: name,
          authority: account?.authority || authorityPublicKey.toString(),
          subAccountId: account?.subAccountId || 0,
          delegate: account?.delegate || null,
          totalDeposits: account?.totalDeposits?.toString() || '0',
          totalWithdraws: account?.totalWithdraws?.toString() || '0',
          settledPerpPnl: account?.settledPerpPnl?.toString() || '0',
          lastActiveSlot: account?.lastActiveSlot?.toString() || '0',
          openOrders: account?.openOrders || 0,
          hasOpenOrder: account?.hasOpenOrder || false,
          isMarginTradingEnabled: account?.isMarginTradingEnabled || false,
          marginMode: account?.marginMode?.default ? 'Default' : 'Cross',
          spotPositions: Array.isArray(account?.spotPositions) ? account.spotPositions : [],
          perpPositions: Array.isArray(account?.perpPositions) ? account.perpPositions : []
        };
      });
      
      set({ userAccounts: transformedAccounts });
    } catch (error) {
      console.error('Error fetching accounts:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch user accounts' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 