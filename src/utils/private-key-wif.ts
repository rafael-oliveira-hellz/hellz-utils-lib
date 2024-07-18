import { BIP32Interface } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import { dogecoin } from "../networks";

/**
 * Generates a private key WIF and wallet address from the given root.
 *
 * @param {BIP32Interface} root - The root to generate the private key WIF from.
 * @return {Object} The generated private key WIF and wallet address.
 */
export function generatePrivateKeyWIF(root: BIP32Interface): {
  privateKeyWIF: string;
  address: string;
} {
  const childNode = root.derivePath(`m/44'/3'/0'/0/0`);
  const privateKeyWIF = childNode.toWIF();

  const { address } = bitcoin.payments.p2pkh({
    pubkey: childNode.publicKey,
    network: dogecoin,
  });

  return {
    privateKeyWIF,
    address: address!,
  };
}
