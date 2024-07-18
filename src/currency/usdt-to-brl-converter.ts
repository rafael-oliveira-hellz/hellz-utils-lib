import axios from "axios";

interface CoinGeckoResponse {
  tether: {
    brl: number;
  };
}

/**
 * Retrieves the exchange rate of USDT (Tether) to BRL (Brazilian Real) from CoinGecko API
 * and calculates the amount in BRL for the given USDT amount.
 *
 * @param {number} amount - The amount in USDT to be converted to BRL.
 * @return {Promise<number>} The equivalent amount in BRL.
 */
export async function convertUSDTToBRL(amount: number): Promise<number> {
  try {
    const response = await axios.get<CoinGeckoResponse>(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl"
    );
    const exchangeRate = response.data.tether.brl;
    return amount * exchangeRate;
  } catch (error) {
    console.error("Error fetching BRL to USDT rate:", error);
    throw new Error("Unable to fetch exchange rate");
  }
}
