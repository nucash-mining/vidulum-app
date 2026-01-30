/**
 * Solana Client Tests
 *
 * Focused tests for SPL token balance parsing.
 */

import { SolanaClient } from '@/lib/solana/client';
import { mockFetchResponse } from '../../setup';

function rpcResponse(result: unknown) {
  return mockFetchResponse({
    jsonrpc: '2.0',
    id: expect.any(Number),
    result,
  });
}

describe('Solana Client', () => {
  let client: SolanaClient;

  beforeEach(() => {
    client = new SolanaClient('solana-mainnet');
    jest.clearAllMocks();
  });

  describe('getSplTokenBalance', () => {
    it('should sum tokenAmount.amount across token accounts', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        rpcResponse({
          value: [
            {
              account: {
                data: {
                  parsed: {
                    info: {
                      tokenAmount: { amount: '123', uiAmountString: '0.000123' },
                    },
                  },
                },
              },
            },
            {
              account: {
                data: {
                  parsed: {
                    info: {
                      tokenAmount: { amount: '7', uiAmountString: '0.000007' },
                    },
                  },
                },
              },
            },
          ],
        })
      );

      const bal = await client.getSplTokenBalance(
        '7bZx8r5s1jZKc5b1xS2ZrK8y9nZJ9r8y8bZx8r5s1jZK',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      );

      expect(bal).toBe(130n);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const [, init] = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(init.body);
      expect(body.method).toBe('getTokenAccountsByOwner');
    });

    it('should return 0 when no token accounts are found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        rpcResponse({
          value: [],
        })
      );

      const bal = await client.getSplTokenBalance(
        '7bZx8r5s1jZKc5b1xS2ZrK8y9nZJ9r8y8bZx8r5s1jZK',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      );

      expect(bal).toBe(0n);
    });
  });
});
