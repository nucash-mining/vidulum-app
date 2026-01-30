/**
 * Networks Module
 *
 * Central export point for all network-related functionality.
 */

// Types
export type {
  NetworkType,
  BaseNetworkConfig,
  CosmosNetworkConfig,
  BitcoinNetworkConfig,
  EvmNetworkConfig,
  SvmNetworkConfig,
  NetworkConfig,
  EndpointHealth,
} from './types';

// Network configurations (manual overrides only - most come from auto-generated registries)
export { BEEZEE_TESTNET, COSMOS_NETWORKS } from './cosmos';

export { BITCOIN_MAINNET, BITCOIN_TESTNET, BITCOIN_NETWORKS } from './bitcoin';

export { EVM_NETWORKS } from './evm';

export {
  SOLANA_MAINNET,
  SOLANA_DEVNET,
  SOLANA_TESTNET,
  ECLIPSE_MAINNET,
  ECLIPSE_TESTNET,
  SONIC_MAINNET,
  SONIC_TESTNET,
  SVM_NETWORKS,
} from './solana';

// EVM Registry (auto-generated from ethereum-lists/chains)
export {
  EVM_REGISTRY_CHAINS,
  getEvmChainById,
  getEvmChainByShortName,
  getEvmChainByInternalId,
  getEnabledEvmChains,
  getMainnetEvmChains,
  getTestnetEvmChains,
  type EvmRegistryConfig,
} from './evm-registry';

// Registry and helpers
export {
  networkRegistry,
  getExplorerAccountUrl,
  getExplorerTxUrl,
  isCosmosNetwork,
  isBitcoinNetwork,
  isEvmNetwork,
  isSvmNetwork,
  getUINetworks,
} from './registry';

// Failover utilities
export {
  fetchWithFailover,
  withFailover,
  getHealthyEndpoint,
  getSortedEndpoints,
  resetEndpointHealth,
  getEndpointHealthStatus,
  clearAllEndpointHealth,
  type FailoverConfig,
} from './failover';

// Chain Registry Clients (dynamic chain fetching)
export { chainRegistryClient } from './chain-registry-client';
export { evmRegistryClient } from './evm-registry-client';
