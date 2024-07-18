import axios from "axios";

interface CoinGeckoDogecoinResponse {
  dogecoin: {
    usdt: number;
  };
}

/**
 * Retrieves the exchange rate of DOGE (Dogecoin) to USDT (Tether) from CoinGecko API
 * and calculates the amount in USDT for the given DOGE amount.
 *
 * @param {number} amount - The amount in DOGE to be converted to USDT.
 * @return {Promise<number>} The equivalent amount in USDT.
 */
export async function convertDOGEToUSDT(amount: number): Promise<number> {
  try {
    const response = await axios.get<CoinGeckoDogecoinResponse>(
      "https://api.coingecko.com/api/v3/simple/price?ids=dogecoin&vs_currencies=usdt"
    );
    const exchangeRate = response.data.dogecoin.usdt;
    return amount * exchangeRate;
  } catch (error) {
    console.error("Error fetching DOGE to USDT rate:", error);
    throw new Error("Unable to fetch exchange rate");
  }
}
