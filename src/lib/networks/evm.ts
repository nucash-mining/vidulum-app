/**
 * EVM Network Configurations
 *
 * Manual EVM network definitions for networks NOT in the auto-generated registry.
 * Mainnet chains are provided by evm-registry.ts (auto-generated from ethereum-lists/chains).
 */

import { EvmNetworkConfig } from './types';

// Altcoinchain Mainnet
export const ALTCOINCHAIN_MAINNET: EvmNetworkConfig = {
  id: 'alt-mainnet',
  name: 'Altcoinchain',
  type: 'evm',
  enabled: true,
  symbol: 'ALT',
  decimals: 18,
  coinType: 60,
  chainId: 2330,
  rpcUrls: ['https://alt-rpc2.minethepla.net'],
  nativeCurrency: {
    name: 'Altcoinchain',
    symbol: 'ALT',
    decimals: 18,
  },
  logoUrl: '/chains/altcoinchain.png',
  explorerUrl: 'https://alt-exp.outsidethebox.top',
  explorerAccountPath: '/address/{address}',
  explorerTxPath: '/tx/{txHash}',
};

// All manual EVM networks for registration
// Note: Mainnet chains come from evm-registry.ts
export const EVM_NETWORKS: EvmNetworkConfig[] = [ALTCOINCHAIN_MAINNET];
