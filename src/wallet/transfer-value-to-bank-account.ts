import axios from "axios";
import { convertDOGEToUSDT, convertUSDTToBRL } from "../currency";

interface Recipient {
  name: string;
  document_number: string;
}

/**
 * Transfers BRL to a bank account using the Pagar.me API and PIX key.
 *
 * @param {number} amount - The amount to transfer in DOGECOIN.
 * @param {string} pixKey - The PIX key of the recipient.
 * @return {Promise<void>}
 */
export async function transferValueInPIX(
  amount: number,
  pixKey: string,
  recipient: Recipient
): Promise<void> {
  const amountInUSDT = await convertDOGEToUSDT(amount);
  const amountInBRL = await convertUSDTToBRL(amountInUSDT);

  const pagarMeApiKey = "your_pagarme_api_key";
  const data = {
    amount: Math.floor(amountInBRL * 100),
    payment_method: "pix",
    pix: {
      pix_key: pixKey,
      recipient_name: recipient.name,
      recipient_document_number: recipient.document_number,
    },
  };

  try {
    const response = await axios.post(
      "https://api.pagar.me/core/v5/transactions",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": pagarMeApiKey,
        },
      }
    );
    console.log("Transaction successful:", response.data);
  } catch (error) {
    console.error("Error making PIX transaction:", error);
    throw new Error("PIX transaction failed");
  }
}
