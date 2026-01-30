/**
 * Chain Registry Tests
 *
 * Tests for asset registry and token metadata
 */

import {
  fetchChainAssets,
  fetchManageableAssets,
  getAssetByDenom,
  getTokenColor,
} from '@/lib/assets/chainRegistry';
import { mockFetchResponse } from '../../setup';

describe('Chain Registry', () => {
  describe('fetchChainAssets', () => {
    describe('Bitcoin/UTXO chains (static assets)', () => {
      it('should return assets for Bitcoin mainnet', async () => {
        const assets = await fetchChainAssets('bitcoin-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('BTC');
        expect(assets[0].decimals).toBe(8);
        expect(assets[0].denom).toBe('sat');
      });

      it('should return assets for Litecoin', async () => {
        const assets = await fetchChainAssets('litecoin-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('LTC');
        expect(assets[0].decimals).toBe(8);
      });

      it('should return assets for Zcash', async () => {
        const assets = await fetchChainAssets('zcash-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('ZEC');
      });

      it('should return assets for Dogecoin', async () => {
        const assets = await fetchChainAssets('dogecoin-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('DOGE');
      });

      it('should return assets for Ravencoin', async () => {
        const assets = await fetchChainAssets('ravencoin-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('RVN');
      });

      it('should return assets for Ritocoin', async () => {
        const assets = await fetchChainAssets('ritocoin-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('RITO');
      });

      it('should return assets for NOSO', async () => {
        const assets = await fetchChainAssets('noso-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('NOSO');
      });

      it('should return assets for Flux', async () => {
        const assets = await fetchChainAssets('flux-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('FLUX');
      });

      it('should return assets for BitcoinZ', async () => {
        const assets = await fetchChainAssets('bitcoinz-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('BTCZ');
      });
    });

    describe('EVM chains (static assets)', () => {
      it('should return assets for Ethereum', async () => {
        const assets = await fetchChainAssets('eth-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('ETH');
        expect(assets[0].decimals).toBe(18);
      });

      it('should return assets for legacy Ethereum ID alias', async () => {
        const assets = await fetchChainAssets('ethereum-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('ETH');
        expect(assets[0].denom).toBe('wei');
      });

      it('should return assets for BNB Chain', async () => {
        const assets = await fetchChainAssets('bnb-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('BNB');
      });

      it('should return assets for Base', async () => {
        const assets = await fetchChainAssets('base-mainnet');

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('ETH');
      });
    });

    describe('Cosmos chains (with fetch)', () => {
      it('should return fallback assets for unknown chain mapping', async () => {
        const assets = await fetchChainAssets('unknown-cosmos-chain');
        expect(assets).toEqual([]);
      });

      it('should return fallback assets when fetch fails', async () => {
        // Mock a failed fetch
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        const assets = await fetchChainAssets('beezee-1');

        // Should return fallback assets
        expect(assets.length).toBeGreaterThan(0);
        const bze = assets.find((a) => a.symbol === 'BZE');
        expect(bze).toBeDefined();
      });

      it('should parse chain registry response correctly', async () => {
        const mockAssetList = {
          chain_name: 'beezee',
          assets: [
            {
              description: 'BeeZee native token',
              denom_units: [
                { denom: 'ubze', exponent: 0 },
                { denom: 'bze', exponent: 6 },
              ],
              base: 'ubze',
              name: 'BeeZee',
              display: 'bze',
              symbol: 'BZE',
              coingecko_id: 'bzedge',
            },
          ],
        };

        // fetchChainAssets caches results in-module. Reset modules to avoid cache hits,
        // then disable the pre-bundled entry so this test exercises the fetch parsing path.
        jest.resetModules();

        const { COSMOS_REGISTRY_ASSETS } = await import('@/lib/assets/cosmos-registry');
        const prevBundled = COSMOS_REGISTRY_ASSETS.beezee;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (COSMOS_REGISTRY_ASSETS as any).beezee = undefined;

        (global.fetch as jest.Mock).mockResolvedValueOnce(mockFetchResponse(mockAssetList));

        const { fetchChainAssets: fetchChainAssetsFresh } =
          await import('@/lib/assets/chainRegistry');
        const assets = await fetchChainAssetsFresh('beezee-1');

        // Restore bundled assets for any subsequent dynamic imports.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (COSMOS_REGISTRY_ASSETS as any).beezee = prevBundled;

        expect(assets.length).toBe(1);
        expect(assets[0].symbol).toBe('BZE');
        expect(assets[0].denom).toBe('ubze');
        expect(assets[0].decimals).toBe(6);
        expect(assets[0].coingeckoId).toBe('bzedge');
      });
    });

    it('should return empty array for completely unknown chain', async () => {
      const assets = await fetchChainAssets('totally-unknown-chain-xyz');
      expect(assets).toEqual([]);
    });
  });

  describe('fetchManageableAssets', () => {
    it('should include curated ERC20s for Ethereum mainnet', async () => {
      const assets = await fetchManageableAssets('eth-mainnet');

      // Native + curated tokens
      expect(assets.length).toBeGreaterThanOrEqual(3);
      expect(assets[0].denom).toBe('wei');

      const usdc = assets.find((a) => a.symbol === 'USDC');
      const usdt = assets.find((a) => a.symbol === 'USDT');

      expect(usdc).toBeDefined();
      expect(usdt).toBeDefined();
      expect(usdc?.denom).toBe('erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48');
      expect(usdt?.denom).toBe('erc20:0xdac17f958d2ee523a2206206994597c13d831ec7');
    });

    it('should include curated SPL20s for Solana mainnet', async () => {
      const assets = await fetchManageableAssets('solana-mainnet');

      expect(assets.length).toBeGreaterThanOrEqual(4);

      const native = assets.find((a) => a.denom === 'lamports');
      const usdc = assets.find((a) => a.symbol === 'USDC');
      const usdt = assets.find((a) => a.symbol === 'USDT');
      const eth = assets.find((a) => a.symbol === 'ETH');

      expect(native).toBeDefined();
      expect(usdc).toBeDefined();
      expect(usdt).toBeDefined();
      expect(eth).toBeDefined();

      expect(usdc?.denom).toBe('spl20:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
      expect(usdt?.denom).toBe('spl20:Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
      expect(eth?.denom).toBe('spl20:7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs');
    });
  });

  describe('getAssetByDenom', () => {
    it('should find asset by denom in array', () => {
      const assets = [
        { symbol: 'BZE', name: 'BeeZee', denom: 'ubze', decimals: 6 },
        { symbol: 'VDL', name: 'Vidulum', denom: 'factory/bze.../uvdl', decimals: 6 },
      ];

      const asset = getAssetByDenom(assets, 'ubze');

      expect(asset).toBeDefined();
      expect(asset?.symbol).toBe('BZE');
    });

    it('should return undefined for unknown denom', () => {
      const assets = [{ symbol: 'BZE', name: 'BeeZee', denom: 'ubze', decimals: 6 }];

      const asset = getAssetByDenom(assets, 'unknown-denom');
      expect(asset).toBeUndefined();
    });

    it('should work with empty array', () => {
      const asset = getAssetByDenom([], 'ubze');
      expect(asset).toBeUndefined();
    });
  });

  describe('getTokenColor', () => {
    it('should return color for BTC', () => {
      const color = getTokenColor('BTC');
      expect(color).toBe('#F7931A');
    });

    it('should return color for ETH', () => {
      const color = getTokenColor('ETH');
      expect(color).toBe('#627EEA');
    });

    it('should return color for BZE', () => {
      const color = getTokenColor('BZE');
      expect(color).toBe('#3182CE');
    });

    it('should return color for LTC', () => {
      const color = getTokenColor('LTC');
      expect(color).toBe('#345D9D');
    });

    it('should return color for DOGE', () => {
      const color = getTokenColor('DOGE');
      expect(color).toBe('#C2A633');
    });

    it('should return color for RVN', () => {
      const color = getTokenColor('RVN');
      expect(color).toBe('#384182');
    });

    it('should return color for RITO', () => {
      const color = getTokenColor('RITO');
      expect(color).toBe('#4A90D9');
    });

    it('should return color for NOSO', () => {
      const color = getTokenColor('NOSO');
      expect(color).toBe('#1E88E5');
    });

    it('should return default color for unknown token', () => {
      const color = getTokenColor('UNKNOWN');
      expect(color).toBe('#718096');
    });
  });

  describe('Asset Properties', () => {
    it('should have coingeckoId for major UTXO tokens', async () => {
      const btcAssets = await fetchChainAssets('bitcoin-mainnet');
      expect(btcAssets[0].coingeckoId).toBe('bitcoin');

      const ltcAssets = await fetchChainAssets('litecoin-mainnet');
      expect(ltcAssets[0].coingeckoId).toBe('litecoin');
    });

    it('should have coingeckoId for EVM tokens', async () => {
      const ethAssets = await fetchChainAssets('ethereum-mainnet');
      expect(ethAssets[0].coingeckoId).toBe('ethereum');

      const bnbAssets = await fetchChainAssets('bnb-mainnet');
      expect(bnbAssets[0].coingeckoId).toBe('binancecoin');
    });

    it('should have proper decimals for Bitcoin-like chains', async () => {
      const btcAssets = await fetchChainAssets('bitcoin-mainnet');
      expect(btcAssets[0].decimals).toBe(8);

      const dogeAssets = await fetchChainAssets('dogecoin-mainnet');
      expect(dogeAssets[0].decimals).toBe(8);
    });

    it('should have proper decimals for EVM chains', async () => {
      const ethAssets = await fetchChainAssets('ethereum-mainnet');
      expect(ethAssets[0].decimals).toBe(18);
    });
  });
});
