"use client";

import React, { useMemo, useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
  useWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Wallet adapters
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Store
import { useStore } from "@/store/useStore";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProviders({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}

// Component to capture and set the connection in the store
function ConnectionSetupListener({ children }: { children: React.ReactNode }) {
  const { connection } = useConnection();
  const { setConnection, setNetwork } = useStore();

  useEffect(() => {
    if (connection) {
      setConnection(connection);
      setNetwork(WalletAdapterNetwork.Devnet); // Default to devnet for now
    }
  }, [connection, setConnection, setNetwork]);

  return <>{children}</>;
}

// Component to listen for wallet connection events and initialize Drift client
function WalletConnectionListener({ children }: { children: React.ReactNode }) {
  const { connected, publicKey, wallet } = useWallet();
  const { 
    setWalletConnected, 
    setWalletAddress, 
    setWalletName,
    connection,
    initializeDrift
  } = useStore();

  useEffect(() => {
    setWalletConnected(connected);
    setWalletAddress(publicKey ? publicKey.toString() : null);
    setWalletName(wallet?.adapter.name || null);
  }, [connected, publicKey, wallet, setWalletConnected, setWalletAddress, setWalletName]);

  // Initialize Drift client when wallet connects and connection is available
  useEffect(() => {
    const setupDriftClient = async () => {
      if (connected && wallet && connection) {
        try {
          const success = await initializeDrift(wallet, connection);
          if (success) {
            console.log('Drift client initialized on server-side');
          }
        } catch (error) {
          console.error('Failed to initialize Drift client:', error);
        }
      }
    };

    setupDriftClient();
  }, [connected, wallet, connection, initializeDrift]);

  return <>{children}</>;
}