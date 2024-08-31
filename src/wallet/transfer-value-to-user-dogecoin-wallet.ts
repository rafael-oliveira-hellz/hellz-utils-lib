import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";
import { dogecoin } from "../networks";
import { checkWalletBalance } from "./check-balance";
import { validateWalletBalance } from "../utils/validate-balance";

const ECPair = ECPairFactory(ecc);
const blockCypherApiKey = process.env.BLOCKCYPHER_API_KEY as string;

interface UTXO {
  tx_hash: string;
  tx_output_n: number;
  script: string;
  value: number;
}

/**
 * Retrieves unspent transaction outputs (UTXOs) for the given Dogecoin address.
 *
 * @param {string} address - The Dogecoin address.
 * @return {Promise<UTXO[]>} The list of UTXOs.
 */
export async function getUtxos(address: string): Promise<UTXO[]> {
  const url = `https://api.blockcypher.com/v1/doge/main/addrs/${address}?unspentOnly=true&token=${blockCypherApiKey}`;
  const response = await axios.get(url);
  return response.data.txrefs;
}

/**
 * Adds inputs to a PSBT from the list of UTXOs.
 *
 * @param {bitcoin.Psbt} psbt - The partially signed Bitcoin transaction.
 * @param {UTXO[]} utxos - The list of UTXOs.
 * @param {number} amountInDoge - The amount to transfer in Dogecoin.
 * @return {number} The total input amount added to the PSBT.
 */
function addInputsToPsbt(
  psbt: bitcoin.Psbt,
  utxos: UTXO[],
  amountInDoge: number
): number {
  let inputAmount = 0;
  for (const utxo of utxos) {
    psbt.addInput({
      hash: utxo.tx_hash,
      index: utxo.tx_output_n,
      witnessUtxo: {
        script: Buffer.from(utxo.script, "hex"),
        value: utxo.value,
      },
    });
    inputAmount += utxo.value;
    if (inputAmount >= amountInDoge) break;
  }
  return inputAmount;
}

/**
 * Creates a new PSBT, adds inputs and outputs, and signs the transaction.
 *
 * @param {UTXO[]} utxos - The list of UTXOs.
 * @param {number} amountInDoge - The amount to transfer in Dogecoin.
 * @param {string} toAddress - The recipient's address.
 * @param {string} privateKeyWIF - The private key in WIF format for signing.
 * @param {string} sourceAddress - The user's wallet address from which the funds will be retrieved.
 * @param {string} primaryWalletAddress - The primary wallet address from which the taxes will be sent.
 * @return {bitcoin.Psbt} The signed PSBT.
 */
export function createAndSignPsbt(
  utxos: UTXO[],
  amountInDoge: number,
  toAddress: string,
  privateKeyWIF: string,
  sourceAddress: string,
  primaryWalletAddress: string
): bitcoin.Psbt {
  const psbt = new bitcoin.Psbt({ network: dogecoin });
  const inputAmount = addInputsToPsbt(psbt, utxos, amountInDoge);

  // Calcular as quantias a serem transferidas
  const primaryAmount = Math.floor(amountInDoge * 0.1); // 10% do valor
  const userAmount = amountInDoge - primaryAmount; // 90% do valor

  // Adicionar saída para a carteira principal
  psbt.addOutput({
    address: primaryWalletAddress,
    value: primaryAmount,
  });

  // Adicionar saída para a carteira do usuário
  psbt.addOutput({
    address: toAddress,
    value: userAmount,
  });

  const change = inputAmount - amountInDoge;

  if (change > 0) {
    psbt.addOutput({
      address: sourceAddress, // carteira do usuário dentro do NFT
      value: change,
    });
  }

  const keyPair = ECPair.fromWIF(privateKeyWIF, dogecoin);
  psbt.signAllInputs(keyPair);
  psbt.finalizeAllInputs();

  return psbt;
}

/**
 * Finalizes and extracts the transaction from the PSBT.
 *
 * @param {bitcoin.Psbt} psbt - The signed PSBT.
 * @return {string} The transaction hex.
 */
export function finalizeAndExtractTx(psbt: bitcoin.Psbt): string {
  const tx = psbt.extractTransaction();
  return tx.toHex();
}

/**
 * Broadcasts the transaction to the Dogecoin network.
 *
 * @param {string} txHex - The transaction hex.
 * @return {Promise<string>} The transaction ID.
 */
export async function broadcastTransaction(txHex: string): Promise<string> {
  const url = `https://api.blockcypher.com/v1/doge/main/txs/push?token=${blockCypherApiKey}`;
  const response = await axios.post(url, { tx: txHex });
  return response.data.tx.hash;
}

/**
 * Transfers Dogecoin to the specified address.
 *
 * @param {number} amount - The amount to transfer in DOGE.
 * @param {string} sourceAddress - The source address to transfer from.
 * @param {string} toAddress - The recipient's Dogecoin address.
 * @param {string} privateKeyWIF - The private key in WIF format for signing.
 * @param {string} sourceAddress - The user's wallet address from which the funds will be retrieved.
 * @param {string} primaryWalletAddress - The primary wallet address from which the taxes will be sent.
 * @return {Promise<string>} The transaction ID.
 */
export async function transferValueToUser(
  amount: number,
  sourceAddress: string,
  toAddress: string,
  privateKeyWIF: string,
  primaryWalletAddress: string
): Promise<string> {
  const balance = await checkWalletBalance(sourceAddress);

  validateWalletBalance(balance, amount);

  console.log("Sufficient balance, proceeding with the transaction...");

  if (!privateKeyWIF) {
    throw new Error("Primary wallet data not set");
  }

  const utxos = await getUtxos(sourceAddress);

  const psbt = createAndSignPsbt(
    utxos,
    amount,
    toAddress,
    privateKeyWIF,
    sourceAddress,
    primaryWalletAddress
  );

  const txHex = finalizeAndExtractTx(psbt);

  return await broadcastTransaction(txHex);
}
