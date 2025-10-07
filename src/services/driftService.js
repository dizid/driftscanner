// driftService.js
// Modular service for fetching Drift perpetual positions and PnL data.
// Uses Drift SDK with QuickNode RPC from .env. No Helius or native dependencies.
// Handles errors gracefully.

import {
  DriftClient,
  initialize,
  Wallet,
  Connection,
  PublicKey,
} from '@drift-labs/sdk';
import { clusterApiUrl } from '@solana/web3.js';
import BN from 'bn.js';

// Position structure
const DriftPosition = {
  symbol: '',
  side: 'long',
  size: 0,
  entryPrice: 0,
  markPrice: 0,
  unrealizedPnL: 0,
  realizedPnL: 0,
  timeAgo: '',
};

// PnL summary structure
const PnLSummary = {
  totalUnrealized: 0,
  totalRealized: 0,
  totalPnL: 0,
  positions: [],
};

const ENV = 'mainnet';
const DEFAULT_RPC = import.meta.env.VITE_SOLANA_RPC || clusterApiUrl(ENV);

/**
 * Initializes DriftClient for read-only access.
 * @param {string} rpcUrl - Custom Solana RPC (optional)
 * @returns {Promise<DriftClient>} DriftClient instance
 */
async function getDriftClient(rpcUrl) {
  const connection = new Connection(rpcUrl || DEFAULT_RPC, 'confirmed');
  const dummyWallet = new Wallet(new PublicKey('11111111111111111111111111111112')); // Dummy for read-only
  return initialize({ env: ENV, connection, wallet: dummyWallet });
}

/**
 * Fetches open perpetual positions for a wallet address.
 * Computes PnL using mark prices. Filters to perp markets only.
 * @param {string} walletAddress - Base58 Solana wallet address
 * @param {DriftClient} client - Optional pre-initialized DriftClient
 * @returns {Object|null} Positions array + summary
 */
export async function fetchDriftPositions(walletAddress, client) {
  try {
    let pubkey;
    try {
      pubkey = new PublicKey(walletAddress);
    } catch (e) {
      console.error('Invalid wallet address');
      return null;
    }

    client = client || (await getDriftClient());

    const user = await client.getUser(pubkey);
    if (!user?.userAccount) {
      console.warn('No Drift user account found for wallet');
      return { positions: [], summary: { ...PnLSummary } };
    }

    const positions = [];
    let totalUnrealized = 0;
    let totalRealized = 0;

    for (const pos of user.userAccount.perpPositions) {
      if (pos.baseAssetAmount.eq(new BN(0))) continue;

      const marketIndex = pos.marketIndex.toNumber();
      const market = client.getPerpMarketAccount(marketIndex);
      if (!market) continue;

      const symbol = market.marketInfo.name.split('-')[0];
      const side = pos.baseAssetAmount.gt(new BN(0)) ? 'long' : 'short';
      const size = pos.baseAssetAmount.abs().toNumber() / 1e6;
      const entryPrice = pos.avgEntryPrice.toNumber() / 1e6;
      const markPrice = market.amm.markPrice.toNumber() / 1e6;
      const unrealizedPnL = pos.getUnrealizedPnL(market).toNumber() / 1e9;

      const timeAgo = 'N/A';

      positions.push({ ...DriftPosition, symbol, side, size, entryPrice, markPrice, unrealizedPnL, realizedPnL: 0, timeAgo });
      totalUnrealized += unrealizedPnL;
    }

    const summary = {
      ...PnLSummary,
      totalUnrealized,
      totalRealized,
      totalPnL: totalUnrealized + totalRealized,
      positions,
    };

    return { positions, summary };
  } catch (error) {
    console.error('Error fetching Drift positions:', error);
    return null;
  }
}

/**
 * Exports PnL data to CSV for Google Sheets.
 * @param {Object} data - Positions + summary
 * @returns {string} CSV string
 */
export function exportToCSV(data) {
  if (!data.positions.length) return '';

  let csv = 'Symbol,Side,Size,Entry Price,Mark Price,Unrealized PnL,Total PnL\n';
  data.positions.forEach(pos => {
    csv += `${pos.symbol},${pos.side},${pos.size},${pos.entryPrice},${pos.markPrice},${pos.unrealizedPnL},${data.totalPnL}\n`;
  });
  return csv;
}