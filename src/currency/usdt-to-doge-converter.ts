import axios from "axios";

interface CoinGeckoUsdtResponse {
  tether: {
    doge: number;
  };
}

/**
 * Retrieves the exchange rate of USDT (Tether) to DOGE (Dogecoin) from CoinGecko API
 * and calculates the amount in DOGE for the given USDT amount.
 *
 * @param {number} amount - The amount in USDT to be converted to DOGE.
 * @return {Promise<number>} The equivalent amount in DOGE.
 */
export async function convertUSDTToDOGE(amount: number): Promise<number> {
  try {
    const response = await axios.get<CoinGeckoUsdtResponse>(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=doge"
    );
    const exchangeRate = response.data.tether.doge;
    return amount * exchangeRate;
  } catch (error) {
    console.error("Error fetching USDT to DOGE rate:", error);
    throw new Error("Unable to fetch exchange rate");
  }
}
