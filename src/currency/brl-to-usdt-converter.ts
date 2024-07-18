import axios from "axios";

interface CoinGeckoResponse {
  tether: {
    brl: number;
  };
}

/**
 * Retrieves the exchange rate of BRL (Brazilian Real) to USDT (Tether) from CoinGecko API.
 *
 * @return {Promise<number>} The BRL to USDT exchange rate.
 */
export async function convertBRLToUSDT(): Promise<number> {
  try {
    const response = await axios.get<CoinGeckoResponse>(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl"
    );
    const rate = response.data.tether.brl;
    return 1 / rate;
  } catch (error) {
    console.error("Error fetching BRL to USDT rate:", error);
    throw new Error("Unable to fetch exchange rate");
  }
}
