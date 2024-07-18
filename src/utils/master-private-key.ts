import { BIP32Interface } from "bip32";

/**
 * Generates a master private key from the given root.
 *
 * @param {BIP32Interface} root - The root to generate the master private key from.
 * @return {string} The generated master private key.
 */
export function generateMasterPrivateKey(root: BIP32Interface): string {
  return root.toBase58();
}
