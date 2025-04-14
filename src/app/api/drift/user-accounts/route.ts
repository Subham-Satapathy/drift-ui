import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import {
  DriftClient,
  DriftClientConfig,
  DRIFT_PROGRAM_ID,
  DriftEnv,
  BN,
  convertToNumber,
  SpotMarkets,
  PerpMarkets,
  SpotPosition,
  PerpPosition,
} from '@drift-labs/sdk';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Define structure based on actual Drift SDK response
interface DriftUserAccountInfo {
  publicKey: PublicKey;
  userIndex: number;
  name: number[];
  authority: string;
  subAccountId: number;
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
  },
  spotPositions?: SpotPosition[];
  perpPositions?: PerpPosition[];
}

// Helper function to initialize a read-only Drift client
async function initializeDriftClient(connection: Connection, env: DriftEnv, walletPublicKey: PublicKey) {
  const driftProgramId = new PublicKey(DRIFT_PROGRAM_ID);

  // Create a simple read-only wallet
  const readOnlyWallet = {
    publicKey: walletPublicKey,
    signTransaction: async () => { throw new Error('Read-only wallet cannot sign'); },
    signAllTransactions: async () => { throw new Error('Read-only wallet cannot sign'); },
  };

  const config: DriftClientConfig = {
    connection,
    wallet: readOnlyWallet,
    programID: driftProgramId,
    accountSubscription: {
      type: 'websocket',
    },
    env,
    opts: {
      commitment: 'confirmed',
    },
  };

  const driftClient = new DriftClient(config);
  await driftClient.subscribe();

  return driftClient;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const publicKey = url.searchParams.get('publicKey');
    const network = url.searchParams.get('network') || WalletAdapterNetwork.Devnet;

    if (!publicKey) {
      return NextResponse.json({ error: 'Public key is required' }, { status: 400 });
    }

    // Use environment variable or fallback based on the network parameter
    const envConfig = process.env.NEXT_PUBLIC_CLUSTER || 'devnet';
    const isMainnet = network === WalletAdapterNetwork.Mainnet || envConfig === 'mainnet';
    const env = isMainnet ? 'mainnet-beta' as DriftEnv : 'devnet' as DriftEnv;

    // Get RPC URL from environment variables
    const rpcUrl = isMainnet
      ? process.env.NEXT_PUBLIC_SOLANA_RPC_MAINNET
      : process.env.NEXT_PUBLIC_SOLANA_RPC_DEVNET;

    if (!rpcUrl) {
      return NextResponse.json({ error: 'RPC URL not configured' }, { status: 500 });
    }

    const connection = new Connection(rpcUrl, 'confirmed');

    // Get the authority public key
    const authorityPublicKey = new PublicKey(publicKey);

    // Initialize a read-only Drift client for this request
    const driftClient = await initializeDriftClient(connection, env, authorityPublicKey);

    // Get all user accounts for this authority
    const userAccounts = await driftClient.getUserAccountsForAuthority(
      authorityPublicKey
    ) as unknown as DriftUserAccountInfo[];

    if (!userAccounts || !Array.isArray(userAccounts)) {
      return NextResponse.json({
        error: 'Invalid response from Drift SDK',
        details: userAccounts
      }, { status: 500 });
    }

    const transformedUserAccounts = transformUserAccounts(userAccounts, env);


    if (userAccounts.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'No user accounts found for this authority'
      });
    }

    return NextResponse.json({
      success: true,
      data: transformedUserAccounts
    });

  } catch (error) {
    console.error('Error getting user accounts:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to get user accounts'
    }, { status: 500 });
  }
}

function transformUserAccounts(userAccounts: DriftUserAccountInfo[], env: DriftEnv) {
  const BASE_PRECISION = new BN(10).pow(new BN(9));
  const QUOTE_PRECISION = new BN(10).pow(new BN(6));

  // Fix the require imports by importing directly
  const SpotMarketsObj = SpotMarkets;
  const PerpMarketsObj = PerpMarkets;

  return userAccounts.map((userAccount) => {
    return {
      ...userAccount,
      totalDeposits: userAccount.totalDeposits !== undefined ?
        convertToNumber(new BN(userAccount.totalDeposits), BASE_PRECISION) :
        undefined,
      totalWithdraws: userAccount.totalWithdraws !== undefined ?
        convertToNumber(new BN(userAccount.totalWithdraws), BASE_PRECISION) :
        undefined,
      settledPerpPnl: userAccount.settledPerpPnl !== undefined ?
        convertToNumber(new BN(userAccount.settledPerpPnl), BASE_PRECISION) :
        undefined,
      spotPositions: userAccount.spotPositions?.map((spotPosition) => {
        const market = SpotMarketsObj[env].find((m) => m.marketIndex === spotPosition.marketIndex);
        return {
          ...spotPosition,
          scaledBalance: spotPosition.scaledBalance !== undefined ?
            convertToNumber(new BN(spotPosition.scaledBalance, 16), QUOTE_PRECISION) :
            undefined,
          cumulativeDeposits: spotPosition.cumulativeDeposits !== undefined ?
            convertToNumber(new BN(spotPosition.cumulativeDeposits), QUOTE_PRECISION) :
            undefined,
          marketIndex: spotPosition.marketIndex,
          market: market?.symbol
        };
      }),
      perpPositions: userAccount.perpPositions?.map((perpPosition) => {
        const market = PerpMarketsObj[env].find((m) => m.marketIndex === perpPosition.marketIndex);
        return {
          ...perpPosition,
          baseAssetAmount: perpPosition.baseAssetAmount !== undefined ?
            convertToNumber(new BN(perpPosition.baseAssetAmount), BASE_PRECISION) :
            undefined,
          quoteAssetAmount: perpPosition.quoteAssetAmount !== undefined ?
            convertToNumber(new BN(perpPosition.quoteAssetAmount), QUOTE_PRECISION) :
            undefined,
          quoteEntryAmount: perpPosition.quoteEntryAmount !== undefined ?
            convertToNumber(new BN(perpPosition.quoteEntryAmount), QUOTE_PRECISION) :
            undefined,
          quoteBreakEvenAmount: perpPosition.quoteBreakEvenAmount !== undefined ?
            convertToNumber(new BN(perpPosition.quoteBreakEvenAmount), QUOTE_PRECISION) :
            undefined,
          settledPnl: perpPosition.settledPnl !== undefined ?
            convertToNumber(new BN(perpPosition.settledPnl), QUOTE_PRECISION) :
            undefined,
          marketIndex: perpPosition.marketIndex,
          market: market?.symbol
        };
      })
    };
  });
}

