import * as ecc from "tiny-secp256k1";
import { BIP32Factory, BIP32Interface } from "bip32";
import { dogecoin } from "../networks";

const bip32 = BIP32Factory(ecc);

/**
 * Generates a root from the given seed.
 *
 * @param {Buffer} seed - The seed to generate the root from.
 * @return {BIP32Interface} The generated root.
 */
export function generateRoot(seed: Buffer): BIP32Interface {
  return bip32.fromSeed(seed, dogecoin);
}
