import {
  generateRoot,
  generateMasterPrivateKey,
  generatePrivateKeyWIF,
  generateMnemonic,
  mnemonicToSeed,
} from "../utils";
import GlobalValues from "../utils/global-values";

export interface WalletData {
  mnemonic: string;
  masterPrivateKey: string;
  privateKeyWIF: string;
  walletAddress: string;
}

/**
 * Generates primary data including mnemonic, seed, master private key, private key WIF,
 * and primary wallet address. Stores values globally.
 *
 * @return {WalletData} Object containing mnemonic, masterPrivateKey, privateKeyWIF, and walletAddress.
 */
export async function generatePrimaryWalletData(): Promise<WalletData> {
  const mnemonic = generateMnemonic();
  console.log(`Mnemonic: ${mnemonic}`);

  const seed = mnemonicToSeed(mnemonic);

  const root = generateRoot(seed);
  const masterPrivateKey = generateMasterPrivateKey(root);
  console.log(`Master Private Key: ${masterPrivateKey}`);

  const { privateKeyWIF, address } = generatePrivateKeyWIF(root);
  console.log(`Private Key WIF: ${privateKeyWIF}`);
  console.log(`Primary Wallet Address: ${address}`);

  const globalValues = GlobalValues.getInstance();
  globalValues.setMasterPrivateKey(masterPrivateKey);
  globalValues.setPrivateKeyWIF(privateKeyWIF);
  globalValues.setPrimaryWalletAddress(address);

  return {
    mnemonic,
    masterPrivateKey,
    privateKeyWIF,
    walletAddress: address,
  };
}
