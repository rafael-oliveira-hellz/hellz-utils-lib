import axios from "axios";

const blockCypherApiKey = "your_blockcypher_api_key";

/**
 * Retrieves the balance for a given address from the BlockCypher API.
 *
 * @param {string} address - The address to check the balance for.
 * @return {Promise<number>} The balance in satoshis for the provided address.
 */
async function checkBalance(address: string): Promise<number> {
  try {
    const url = `https://api.blockcypher.com/v1/doge/main/addrs/${address}/balance?token=${blockCypherApiKey}`;
    const response = await axios.get(url);
    const balance = response.data.balance;
    console.log(`Balance for address ${address}: ${balance} satoshis`);
    return balance;
  } catch (error) {
    console.error("Error checking balance:", error);
    return 0;
  }
}

/**
 * Retrieves the balance of the primary wallet address.
 *
 * @return {Promise<number>} The balance of the primary wallet address in satoshis.
 * @throws {Error} If the primary wallet address is not set.
 */
export async function checkWalletBalance(address: string): Promise<number> {
  return await checkBalance(address);
}
