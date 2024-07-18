import * as bip39 from "bip39";

/**
 * Generates a mnemonic phrase.
 *
 * @return {string} The generated mnemonic phrase.
 */
export function generateMnemonic(): string {
  return bip39.generateMnemonic();
}

/**
 * Converts a mnemonic phrase to a seed.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @return {Buffer} The generated seed.
 */
export function mnemonicToSeed(mnemonic: string): Buffer {
  return bip39.mnemonicToSeedSync(mnemonic);
}
