import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

interface DriftApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

interface UserAccount {
  userAccountPublicKey: string;
  userIndex: string;
  name: string;
  authority: string;
  subAccountId: number;
  delegate: string | null;
}

/**
 * Service to interact with the server-side Drift API
 */
export const driftService = {
  /**
   * Initialize the Drift client on the server
   */
  initializeClient: async (
    publicKey: string, 
    network: WalletAdapterNetwork
  ): Promise<DriftApiResponse> => {
    try {
      const response = await fetch('/api/drift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'initialize',
          publicKey,
          network,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize Drift client');
      }
      
      return data;
    } catch (error) {
      console.error('Error initializing Drift client:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
  
  /**
   * Get user accounts for the connected wallet
   */
  getUserAccounts: async (
    publicKey: string,
    network: WalletAdapterNetwork
  ): Promise<{ success: boolean; data?: UserAccount[]; error?: string }> => {
    try {
      const response = await fetch(
        `/api/drift/user-accounts?publicKey=${publicKey}&network=${network}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get user accounts');
      }
      
      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error getting user accounts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

}; 