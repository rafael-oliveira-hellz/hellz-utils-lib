import axios from "axios";

interface CoinGeckoDogecoinResponse {
  price: string;
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
      "https://api.binance.com/api/v3/ticker/price?symbol=DOGEUSDT"
    );
    const exchangeRate = parseFloat(response.data.price);
    return amount * exchangeRate;
  } catch (error) {
    console.error("Error fetching DOGE to USDT rate:", error);
    throw new Error("Unable to fetch exchange rate");
  }
}
