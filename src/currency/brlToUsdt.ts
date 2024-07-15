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
export async function getBRLToUSDT(): Promise<number> {
  try {
    const response = await axios.get<CoinGeckoResponse>(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl"
    );
    const rate = response.data.tether.brl;
    const brlToUsdtRate = 1 / rate;

    console.log(`1 BRL = ${brlToUsdtRate} USDT`);

    return brlToUsdtRate;
  } catch (error) {
    console.error("Error fetching the exchange rate:", error);
    throw error;
  }
}
