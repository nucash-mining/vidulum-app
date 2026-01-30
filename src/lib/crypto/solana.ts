/**
 * Solana Cryptography Utilities
 *
 * Handles Solana key derivation from mnemonic using BIP44.
 * Uses BIP32/BIP44 with coin type 501 for Solana.
 */

import { mnemonicToSeedSync } from 'bip39';
import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import * as secp256k1 from '@noble/secp256k1';

/**
 * Solana uses Ed25519 curve (different from secp256k1 used by Bitcoin/Ethereum/Cosmos)
 * BIP44 path: m/44'/501'/0'/0'
 */

export interface SolanaKeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  address: string; // Base58-encoded public key
}

// Base58 encoding/decoding
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function encodeBase58(buffer: Uint8Array): string {
  if (buffer.length === 0) return '';

  let digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }

  // Leading zeros
  for (let i = 0; buffer[i] === 0 && i < buffer.length - 1; i++) {
    digits.push(0);
  }

  return digits
    .reverse()
    .map((digit) => BASE58_ALPHABET[digit])
    .join('');
}

function decodeBase58(str: string): Uint8Array {
  if (str.length === 0) return new Uint8Array(0);

  const bytes = [0];
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    const value = BASE58_ALPHABET.indexOf(c);
    if (value === -1) throw new Error('Invalid base58 character');

    let carry = value;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  // Leading zeros
  for (let i = 0; str[i] === '1' && i < str.length - 1; i++) {
    bytes.push(0);
  }

  return new Uint8Array(bytes.reverse());
}

/**
 * Get Solana derivation path for account index
 * @param accountIndex Account index (default: 0)
 * @returns BIP44 path string
 */
export function getSolanaDerivationPath(accountIndex: number = 0): string {
  // Solana standard: m/44'/501'/accountIndex'/0'
  return `m/44'/501'/${accountIndex}'/0'`;
}

/**
 * Derive Solana keypair from mnemonic
 * Note: This is a simplified implementation. For production use with actual Solana transactions,
 * consider using @solana/web3.js or proper Ed25519 derivation libraries.
 *
 * @param mnemonic BIP39 mnemonic phrase
 * @param accountIndex Account index (default: 0)
 * @returns Solana keypair with address
 */
export async function deriveSolanaKeyPair(
  mnemonic: string,
  accountIndex: number = 0
): Promise<SolanaKeyPair> {
  // Convert mnemonic to seed
  const seed = mnemonicToSeedSync(mnemonic);

  // For Solana, we derive from the seed using account index
  // This is a simplified derivation - production should use proper Ed25519 HD derivation
  const path = getSolanaDerivationPath(accountIndex);

  // Use HMAC-SHA512 for key derivation (simplified)
  const pathHash = sha256(new TextEncoder().encode(path));
  const combined = new Uint8Array(seed.length + pathHash.length);
  combined.set(seed);
  combined.set(pathHash, seed.length);
  const derived = sha512(combined);

  // Take first 32 bytes as private key (Ed25519 uses 32-byte keys)
  const privateKey = derived.slice(0, 32);

  // For now, derive public key using secp256k1 (this is a placeholder)
  // In production, this should use Ed25519 curve
  const publicKey = secp256k1.getPublicKey(privateKey, true).slice(1); // Remove prefix, take 32 bytes

  // Solana address is the base58-encoded public key
  const address = encodeBase58(publicKey);

  return {
    publicKey,
    privateKey,
    address,
  };
}

/**
 * Sign data with Solana private key (placeholder)
 * Note: This is a simplified implementation using secp256k1.
 * Production should use Ed25519 signing.
 */
export async function signSolanaMessage(
  data: Uint8Array,
  privateKey: Uint8Array
): Promise<Uint8Array> {
  // Placeholder using secp256k1
  const hash = sha256(data);
  return secp256k1.sign(hash, privateKey).toCompactRawBytes();
}

/**
 * Verify Solana signature (placeholder)
 */
export async function verifySolanaSignature(
  signature: Uint8Array,
  data: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  try {
    const hash = sha256(data);
    return secp256k1.verify(signature, hash, publicKey);
  } catch {
    return false;
  }
}

/**
 * Convert Solana public key to address
 * @param publicKey Public key bytes
 * @returns Base58-encoded address
 */
export function solanaPublicKeyToAddress(publicKey: Uint8Array): string {
  return encodeBase58(publicKey);
}

/**
 * Validate Solana address format
 * @param address Address to validate
 * @returns True if valid Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const decoded = decodeBase58(address);
    return decoded.length === 32; // Solana public keys are 32 bytes
  } catch {
    return false;
  }
}
