/**
 * SVM (Solana Virtual Machine) Network Configurations
 *
 * Network configurations for Solana and SVM-compatible blockchains.
 * SVM chains include Solana, Eclipse, Sonic, and other Solana forks.
 */

import { SvmNetworkConfig } from './types';

// ============================================================================
// Solana Networks
// ============================================================================

// Solana Mainnet
export const SOLANA_MAINNET: SvmNetworkConfig = {
  id: 'solana-mainnet',
  name: 'Solana',
  type: 'svm',
  enabled: true,
  symbol: 'SOL',
  decimals: 9,
  coinType: 501, // BIP44 coin type for Solana
  cluster: 'mainnet-beta',
  isMainnet: true,
  rpcUrls: [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://solana-mainnet.rpc.extrnode.com',
  ],
  logoUrl:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  explorerUrl: 'https://explorer.solana.com',
  explorerAccountPath: '/address/{address}',
  explorerTxPath: '/tx/{txHash}',
};

// Solana Devnet
export const SOLANA_DEVNET: SvmNetworkConfig = {
  id: 'solana-devnet',
  name: 'Solana Devnet',
  type: 'svm',
  enabled: true,
  symbol: 'SOL',
  decimals: 9,
  coinType: 501,
  cluster: 'devnet',
  rpcUrls: ['https://api.devnet.solana.com'],
  logoUrl:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  explorerUrl: 'https://explorer.solana.com',
  explorerAccountPath: '/address/{address}?cluster=devnet',
  explorerTxPath: '/tx/{txHash}?cluster=devnet',
};

// Solana Testnet
export const SOLANA_TESTNET: SvmNetworkConfig = {
  id: 'solana-testnet',
  name: 'Solana Testnet',
  type: 'svm',
  enabled: false, // Disabled by default
  symbol: 'SOL',
  decimals: 9,
  coinType: 501,
  cluster: 'testnet',
  rpcUrls: ['https://api.testnet.solana.com'],
  logoUrl:
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  explorerUrl: 'https://explorer.solana.com',
  explorerAccountPath: '/address/{address}?cluster=testnet',
  explorerTxPath: '/tx/{txHash}?cluster=testnet',
};

// ============================================================================
// Eclipse (Ethereum L2 using SVM)
// ============================================================================

export const ECLIPSE_MAINNET: SvmNetworkConfig = {
  id: 'eclipse-mainnet',
  name: 'Eclipse',
  type: 'svm',
  enabled: true,
  symbol: 'ETH',
  decimals: 18,
  coinType: 501, // Uses Solana key derivation
  cluster: 'mainnet',
  isMainnet: true,
  rpcUrls: ['https://mainnetbeta-rpc.eclipse.xyz'],
  logoUrl: 'https://eclipse.xyz/logo.png',
  explorerUrl: 'https://explorer.eclipse.xyz',
  explorerAccountPath: '/address/{address}',
  explorerTxPath: '/tx/{txHash}',
};

export const ECLIPSE_TESTNET: SvmNetworkConfig = {
  id: 'eclipse-testnet',
  name: 'Eclipse Testnet',
  type: 'svm',
  enabled: false,
  symbol: 'ETH',
  decimals: 18,
  coinType: 501,
  cluster: 'testnet',
  rpcUrls: ['https://testnet.dev2.eclipsenetwork.xyz'],
  logoUrl: 'https://eclipse.xyz/logo.png',
  explorerUrl: 'https://explorer.dev.eclipsenetwork.xyz',
  explorerAccountPath: '/address/{address}',
  explorerTxPath: '/tx/{txHash}',
};

// ============================================================================
// Sonic SVM (Gaming-focused SVM L2 on Solana)
// ============================================================================

export const SONIC_MAINNET: SvmNetworkConfig = {
  id: 'sonic-mainnet',
  name: 'Sonic',
  type: 'svm',
  enabled: false, // Disabled by default - check sonic.game for launch status
  symbol: 'SONIC',
  decimals: 9,
  coinType: 501,
  cluster: 'mainnet',
  isMainnet: true,
  rpcUrls: ['https://rpc.sonic.game'],
  logoUrl: 'https://sonic.game/logo.png',
  explorerUrl: 'https://explorer.sonic.game',
  explorerAccountPath: '/address/{address}',
  explorerTxPath: '/tx/{txHash}',
};

export const SONIC_TESTNET: SvmNetworkConfig = {
  id: 'sonic-testnet',
  name: 'Sonic Testnet',
  type: 'svm',
  enabled: false,
  symbol: 'SONIC',
  decimals: 9,
  coinType: 501,
  cluster: 'testnet',
  rpcUrls: ['https://rpc.testnet.sonic.game'],
  explorerUrl: 'https://explorer.testnet.sonic.game',
  explorerAccountPath: '/address/{address}',
  explorerTxPath: '/tx/{txHash}',
};

// ============================================================================
// Additional SVM Networks
// ============================================================================
// Note: Many "SVM networks" mentioned (Neon EVM, Pyth, MagicBlock) are actually
// programs/infrastructure that run ON Solana mainnet, not separate SVM chains.
// True SVM L2s/forks are limited as the ecosystem is still emerging (2024-2026).
//
// Networks to watch for future addition:
// - Pyth Publisher Network (if it becomes a separate chain)
// - Additional SVM L2 rollups as they launch
// - SVM-based gaming chains beyond Sonic
// ============================================================================

// Export all SVM networks
export const SVM_NETWORKS: SvmNetworkConfig[] = [
  SOLANA_MAINNET,
  SOLANA_DEVNET,
  SOLANA_TESTNET,
  ECLIPSE_MAINNET,
  ECLIPSE_TESTNET,
  SONIC_MAINNET,
  SONIC_TESTNET,
];
