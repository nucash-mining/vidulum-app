/**
 * Solana Client
 *
 * Provides methods for interacting with Solana blockchain.
 * Uses JSON-RPC for balance queries and transaction handling.
 * Includes automatic failover across multiple RPC endpoints.
 */

import {
  networkRegistry,
  SvmNetworkConfig,
  withFailover,
  getHealthyEndpoint,
} from '@/lib/networks';

/**
 * JSON-RPC Error with code for proper failover handling
 */
export class RpcError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
  }
}

// Transaction structure (simplified)
export interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime: number | null;
  confirmationStatus?: 'processed' | 'confirmed' | 'finalized';
}

/**
 * Solana Client Class with automatic endpoint failover
 */
export class SolanaClient {
  private rpcUrls: string[];
  private networkId: string;

  constructor(networkId: string) {
    const network = networkRegistry.getSvm(networkId);
    if (!network) {
      throw new Error(`SVM network ${networkId} not found`);
    }
    this.rpcUrls = network.rpcUrls;
    this.networkId = networkId;
  }

  /**
   * Get network configuration
   */
  getNetwork(): SvmNetworkConfig {
    const network = networkRegistry.getSvm(this.networkId);
    if (!network) {
      throw new Error(`SVM network ${this.networkId} not found`);
    }
    return network;
  }

  /**
   * Make a JSON-RPC call with automatic failover
   */
  private async rpcCall<T>(method: string, params: unknown[] = []): Promise<T> {
    const makeRequest = async (url: string): Promise<T> => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params,
        }),
      });

      if (!response.ok) {
        throw new RpcError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const data = await response.json();

      if (data.error) {
        throw new RpcError(data.error.message || 'RPC error', data.error.code || -1);
      }

      return data.result;
    };

    return withFailover(this.rpcUrls, makeRequest, {
      maxRetries: this.rpcUrls.length,
    }).then((response) => response.result);
  }

  /**
   * Get SOL balance for an address
   * @returns Balance in lamports (1 SOL = 1,000,000,000 lamports)
   */
  async getBalance(address: string): Promise<bigint> {
    const result = await this.rpcCall<{ value: number }>('getBalance', [address]);
    return BigInt(result.value);
  }

  /**
   * Get SPL token balance for an owner address and mint.
   * Returns balance in the token's smallest unit.
   */
  async getSplTokenBalance(ownerAddress: string, mintAddress: string): Promise<bigint> {
    const result = await this.rpcCall<{ value: Array<unknown> }>('getTokenAccountsByOwner', [
      ownerAddress,
      { mint: mintAddress },
      { encoding: 'jsonParsed' },
    ]);

    const accounts = (result?.value || []) as Array<any>;
    let total = 0n;

    for (const acc of accounts) {
      const amountStr: string | undefined =
        acc?.account?.data?.parsed?.info?.tokenAmount?.amount ??
        acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmountString;

      if (typeof amountStr === 'string' && amountStr.length > 0) {
        // amount is already in base units as a decimal string.
        // uiAmountString is decimal in UI units; ignore it if present.
        if (acc?.account?.data?.parsed?.info?.tokenAmount?.amount) {
          total += BigInt(amountStr);
        }
      }
    }

    return total;
  }

  /**
   * Get account info
   */
  async getAccountInfo(address: string): Promise<unknown> {
    return this.rpcCall('getAccountInfo', [address, { encoding: 'jsonParsed' }]);
  }

  /**
   * Get recent blockhash
   */
  async getRecentBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    const result = await this.rpcCall<{
      value: { blockhash: string; lastValidBlockHeight: number };
    }>('getLatestBlockhash', []);
    return result.value;
  }

  /**
   * Send a transaction
   */
  async sendTransaction(
    signedTransaction: string,
    options?: { skipPreflight?: boolean; maxRetries?: number }
  ): Promise<string> {
    const config = {
      encoding: 'base64',
      skipPreflight: options?.skipPreflight ?? false,
      maxRetries: options?.maxRetries,
    };

    return this.rpcCall<string>('sendTransaction', [signedTransaction, config]);
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string): Promise<SolanaTransaction | null> {
    const result = await this.rpcCall<SolanaTransaction | null>('getTransaction', [
      signature,
      { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 },
    ]);
    return result;
  }

  /**
   * Confirm transaction
   */
  async confirmTransaction(signature: string): Promise<{ value: { confirmationStatus: string } }> {
    return this.rpcCall('getSignatureStatuses', [[signature]]);
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address: string, limit: number = 10): Promise<SolanaTransaction[]> {
    const signatures = await this.rpcCall<
      Array<{ signature: string; slot: number; blockTime: number | null }>
    >('getSignaturesForAddress', [address, { limit }]);

    return signatures;
  }

  /**
   * Get current slot
   */
  async getSlot(): Promise<number> {
    return this.rpcCall<number>('getSlot', []);
  }

  /**
   * Get block time
   */
  async getBlockTime(slot: number): Promise<number | null> {
    return this.rpcCall<number | null>('getBlockTime', [slot]);
  }

  /**
   * Get minimum balance for rent exemption
   */
  async getMinimumBalanceForRentExemption(dataLength: number): Promise<bigint> {
    const result = await this.rpcCall<number>('getMinimumBalanceForRentExemption', [dataLength]);
    return BigInt(result);
  }

  /**
   * Request airdrop (devnet/testnet only)
   */
  async requestAirdrop(address: string, lamports: number): Promise<string> {
    return this.rpcCall<string>('requestAirdrop', [address, lamports]);
  }

  /**
   * Get a healthy RPC endpoint
   */
  async getHealthyEndpoint(): Promise<string | null> {
    return getHealthyEndpoint(this.rpcUrls);
  }
}

/**
 * Create a Solana client for a specific network
 */
export function createSolanaClient(networkId: string): SolanaClient {
  return new SolanaClient(networkId);
}

/**
 * Get a Solana client for a specific network (alias for createSolanaClient)
 */
export function getSolanaClient(networkId: string): SolanaClient {
  return new SolanaClient(networkId);
}
