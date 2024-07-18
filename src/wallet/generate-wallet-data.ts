import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
import * as bitcoin from "bitcoinjs-lib";
import GlobalValues from "../utils/global-values";
import { dogecoin } from "../networks";

const bip32 = BIP32Factory(ecc);

/**
 * Generates primary data including mnemonic, seed, master private key, private key WIF,
 * and primary wallet address. Stores values globally.
 *
 * @return {Object} Object containing mnemonic, masterPrivateKey, privateKeyWIF, and walletAddress
 */
export function generatePrimaryWalletData(): object {
  const mnemonic = bip39.generateMnemonic();
  console.log(`Mnemonic: ${mnemonic}`);

  const seed = bip39.mnemonicToSeedSync(mnemonic);
  console.log(`Seed: ${seed.toString("hex")}`);

  const root = bip32.fromSeed(seed, dogecoin);
  const masterPrivateKey = root.toBase58();
  console.log(`Master Private Key: ${masterPrivateKey}`);

  const childNode = root.derivePath(`m/44'/3'/0'/0/0`);
  const privateKeyWIF = childNode.toWIF();
  console.log(`Private Key WIF: ${privateKeyWIF}`);

  const { address } = bitcoin.payments.p2pkh({
    pubkey: childNode.publicKey,
    network: dogecoin,
  });
  console.log(`Primary Wallet Address: ${address}`);

  const globalValues = GlobalValues.getInstance();
  globalValues.setMasterPrivateKey(masterPrivateKey);
  globalValues.setPrivateKeyWIF(privateKeyWIF);
  globalValues.setPrimaryWalletAddress(address!);

  return {
    mnemonic,
    masterPrivateKey,
    privateKeyWIF,
    walletAddress: address,
  };
}
