import * as crypto from "crypto";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
import GlobalValues from "../utils/global-values";
import { dogecoin } from "../networks";

const bip32 = BIP32Factory(ecc);

const globalValues = GlobalValues.getInstance();
const masterPrivateKey = globalValues.getMasterPrivateKey();

if (!masterPrivateKey) {
  throw new Error("Master private key not set");
}

const node = bip32.fromBase58(masterPrivateKey);

/**
 * Converts a UUID to a deterministic integer using SHA-256.
 *
 * @param {string} uuid - The UUID to convert.
 * @return {number} The deterministic integer derived from the UUID.
 */
function uuidToInteger(uuid: string): number {
  const hash = crypto.createHash("sha256").update(uuid).digest("hex");
  return parseInt(hash.slice(0, 8), 16);
}

/**
 * Generates a deposit address for a given user ID.
 *
 * @param {string} userId - The UUID of the user.
 * @return {string} The generated deposit address.
 */
export function generateDepositAddress(userId: string): string {
  const userIndex = uuidToInteger(userId);
  const childNode = node.derivePath(`m/44'/3'/0'/0/${userIndex}`);
  const { address } = bitcoin.payments.p2pkh({
    pubkey: childNode.publicKey,
    network: dogecoin,
  }) as { address: string };
  return address;
}
