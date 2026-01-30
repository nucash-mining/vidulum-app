import type { RegistryAsset } from './chainRegistry';

// Denom encoding used only for asset visibility preferences in the UI.
// Future balance-fetching can parse these as needed.
export const ERC20_DENOM_PREFIX = 'erc20:';
export const SPL20_DENOM_PREFIX = 'spl20:';

function erc20(address: string): string {
  return `${ERC20_DENOM_PREFIX}${address.toLowerCase()}`;
}

function spl20(mint: string): string {
  return `${SPL20_DENOM_PREFIX}${mint}`;
}

// Major, widely-used tokens where contract/mint addresses are stable and verifiable.
// Keep this list intentionally small.
const KNOWN_EVM_ASSETS: Record<string, RegistryAsset[]> = {
  'eth-mainnet': [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      denom: erc20('0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'),
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      denom: erc20('0xdAC17F958D2ee523a2206206994597C13D831ec7'),
      decimals: 6,
      coingeckoId: 'tether',
    },
  ],
  'base-mainnet': [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      denom: erc20('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'),
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      denom: erc20('0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2'),
      decimals: 6,
      coingeckoId: 'tether',
    },
  ],
  'bnb-mainnet': [
    {
      symbol: 'USDC',
      name: 'USD Coin (BSC)',
      denom: erc20('0x8AC76a51cc950d9822d68b83fe1ad97b32cd580d'),
      decimals: 18,
      coingeckoId: 'usd-coin',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD (BSC)',
      denom: erc20('0x55d398326f99059ff775485246999027b3197955'),
      decimals: 18,
      coingeckoId: 'tether',
    },
  ],
};

// Backward-compatible aliases for older network IDs.
KNOWN_EVM_ASSETS['ethereum-mainnet'] = KNOWN_EVM_ASSETS['eth-mainnet'];

const KNOWN_SVM_ASSETS: Record<string, RegistryAsset[]> = {
  'solana-mainnet': [
    {
      symbol: 'USDC',
      name: 'USD Coin',
      denom: spl20('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    {
      symbol: 'USDT',
      name: 'Tether USD',
      denom: spl20('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
      decimals: 6,
      coingeckoId: 'tether',
    },
    {
      symbol: 'ETH',
      name: 'Ether (Wormhole)',
      denom: spl20('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
      decimals: 8,
      coingeckoId: 'ethereum',
    },
  ],
  // Devnet has a well-known USDC mint; keep list small and reliable.
  'solana-devnet': [
    {
      symbol: 'USDC',
      name: 'USD Coin (Devnet)',
      denom: spl20('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'),
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
  ],
};

export function getKnownVerifiableAssets(networkId: string): RegistryAsset[] {
  if (networkId in KNOWN_EVM_ASSETS) return KNOWN_EVM_ASSETS[networkId];
  if (networkId in KNOWN_SVM_ASSETS) return KNOWN_SVM_ASSETS[networkId];
  return [];
}
