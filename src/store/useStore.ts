import { create } from 'zustand';
import { Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Wallet } from '@solana/wallet-adapter-react';
import { driftService } from '../services/driftService';

interface StoreState {
  isWalletConnected: boolean;
  walletAddress: string | null;
  walletName: string | null;
  connection: Connection | null;
  network: WalletAdapterNetwork;
  driftInitialized: boolean;
  isInitializing: boolean;
  
  setWalletConnected: (connected: boolean) => void;
  setWalletAddress: (address: string | null) => void;
  setWalletName: (name: string | null) => void;
  setConnection: (connection: Connection | null) => void;
  setNetwork: (network: WalletAdapterNetwork) => void;
  initializeDrift: (wallet: Wallet, connection: Connection) => Promise<boolean>;
}

export const useStore = create<StoreState>((set, get) => ({
  isWalletConnected: false,
  walletAddress: null,
  walletName: null,
  connection: null,
  network: WalletAdapterNetwork.Devnet,
  driftInitialized: false,
  isInitializing: false,
  
  setWalletConnected: (connected) => set({ isWalletConnected: connected }),
  setWalletAddress: (address) => set({ walletAddress: address }),
  setWalletName: (name) => set({ walletName: name }),
  setConnection: (connection) => set({ connection }),
  setNetwork: (network) => set({ network }),
  
  initializeDrift: async (wallet, connection) => {
    if (!wallet.adapter.publicKey) {
      console.error('Wallet public key not available');
      return false;
    }
    
    try {
      set({ isInitializing: true });
      
      const { network } = get();
      const publicKeyString = wallet.adapter.publicKey.toString();
      
      // Call the server-side API to initialize Drift
      const response = await driftService.initializeClient(
        publicKeyString,
        network
      );
      
      if (response.success) {
        set({ driftInitialized: true, isInitializing: false });
        console.log('Drift client initialized successfully via API');
        return true;
      } else {
        console.error('Failed to initialize Drift client:', response.error);
        set({ isInitializing: false, driftInitialized: false });
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize Drift client:', error);
      set({ isInitializing: false, driftInitialized: false });
      return false;
    }
  }
})); 