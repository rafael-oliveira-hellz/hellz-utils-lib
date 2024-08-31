import { convertDOGEToUSDT } from "../currency";
import { validateWalletBalance } from "../utils/validate-balance";
import { checkWalletBalance } from "./check-balance";
import {
  broadcastTransaction,
  createAndSignPsbt,
  finalizeAndExtractTx,
  getUtxos,
} from "./transfer-value-to-user-dogecoin-wallet";
import { ethers, InfuraProvider, parseUnits } from "ethers";

const usdtContractAddress = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const erc20Abi = [
  "function transfer(address to, uint amount) public returns (bool)",
];

/**
 * Converts Dogecoin to USDT and transfers the USDT to the specified address.
 *
 * @param {string} toAddress - The recipient's address for the USDT.
 * @param {string} sourceAddress - The user's wallet address from which the funds will be retrieved.
 * @param {string} privateKeyWIF - The private key in WIF format for signing.
 * @param {string} primaryWalletAddress - The primary wallet address from which the taxes will be sent.
 * @return {Promise<string>} The transaction ID.
 */
export async function transferDogecoinToUSDT(
  toAddress: string,
  sourceAddress: string,
  privateKeyWIF: string,
  primaryWalletAddress: string
): Promise<{ dogeTxId: string; usdtTxId: string }> {
  if (!privateKeyWIF) {
    throw new Error("Primary wallet data not set");
  }

  const dogeBalance = await checkWalletBalance(sourceAddress);

  const amountInUsdt = await convertDOGEToUSDT(dogeBalance);

  validateWalletBalance(dogeBalance, amountInUsdt);

  console.log("Sufficient balance, proceeding with the transaction...");

  const utxos = await getUtxos(sourceAddress);

  const psbt = createAndSignPsbt(
    utxos,
    dogeBalance,
    toAddress,
    privateKeyWIF,
    sourceAddress,
    primaryWalletAddress
  );
  const txHex = finalizeAndExtractTx(psbt);
  const dogeTxId = await broadcastTransaction(txHex);

  const usdtTxId = await transferUSDT(amountInUsdt, toAddress);

  return { dogeTxId, usdtTxId };
}

/**
 * Placeholder function for transferring USDT.
 *
 * @param {number} amount - The amount to transfer in USDT.
 * @param {string} toAddress - The recipient's address.
 * @return {Promise<string>} The transaction ID.
 */
/**
 * Transfers USDT to the specified address.
 *
 * @param {number} amount - The amount to transfer in USDT.
 * @param {string} toAddress - The recipient's address.
 * @return {Promise<string>} The transaction ID.
 */
export async function transferUSDT(
  amount: number,
  toAddress: string
): Promise<string> {
  const infura_project_id = process.env.INFURA_PROJECT_ID as string;
  const provider = new InfuraProvider("mainnet", infura_project_id);

  const privateKey = process.env.ETHERIUM_WALLET_PRIVATE_KEY as string;

  const wallet = new ethers.Wallet(privateKey, provider);

  const contract = new ethers.Contract(usdtContractAddress, erc20Abi, wallet);

  const amountInSmallestUnit = parseUnits(amount.toString(), 6);

  const tx = await contract.transfer(toAddress, amountInSmallestUnit);

  const receipt = await tx.wait();

  return receipt.transactionHash;
}
