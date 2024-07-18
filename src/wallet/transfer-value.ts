import axios from "axios";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import ECPairFactory from "ecpair";
import GlobalValues from "../utils/global-values";
import { convertUSDTToDOGE } from "../currency";
import { dogecoin } from "../networks";

const ECPair = ECPairFactory(ecc);
const globalValues = GlobalValues.getInstance();
const blockCypherApiKey = "your_blockcypher_api_key";

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
 * @return {bitcoin.Psbt} The signed PSBT.
 */
export function createAndSignPsbt(
  utxos: UTXO[],
  amountInDoge: number,
  toAddress: string,
  privateKeyWIF: string
): bitcoin.Psbt {
  const psbt = new bitcoin.Psbt({ network: dogecoin });
  const inputAmount = addInputsToPsbt(psbt, utxos, amountInDoge);

  psbt.addOutput({
    address: toAddress,
    value: amountInDoge,
  });

  const change = inputAmount - amountInDoge;
  if (change > 0) {
    const fromAddress = globalValues.getPrimaryWalletAddress();
    psbt.addOutput({
      address: fromAddress!,
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
 * @param {number} amount - The amount to transfer in USDT.
 * @param {string} toAddress - The recipient's Dogecoin address.
 * @return {Promise<string>} The transaction ID.
 */
export async function transferValue(
  amount: number,
  toAddress: string
): Promise<string> {
  const amountInDoge = await convertUSDTToDOGE(amount);

  const fromAddress = globalValues.getPrimaryWalletAddress();
  const privateKeyWIF = globalValues.getPrivateKeyWIF();

  if (!fromAddress || !privateKeyWIF) {
    throw new Error("Primary wallet data not set");
  }

  const utxos = await getUtxos(fromAddress);

  const psbt = createAndSignPsbt(utxos, amountInDoge, toAddress, privateKeyWIF);
  const txHex = finalizeAndExtractTx(psbt);

  return await broadcastTransaction(txHex);
}
