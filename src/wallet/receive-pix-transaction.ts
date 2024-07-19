import axios, { AxiosResponse } from "axios";
import QRCode from "qrcode";

const pagarMeApiKey = process.env.PAGARME_API_KEY as string;

console.log("API KEY: ", pagarMeApiKey);

interface Payee {
  name: string;
  document_number: string;
  email: string;
}

interface PaymentResponse {
  transaction: AxiosResponse;
  qrCodePayload: string;
  qrCodeDataUrl: string;
}

/**
 * Creates a PIX transaction with the specified amount and payee information.
 *
 * @param {number} amount - The amount of the transaction.
 * @param {Payee} payee - The information of the payee including name, email, and document number.
 * @return {Promise<PaymentResponse>} The response object containing transaction details and QR code data.
 */
export async function createPixTransaction(
  amount: number,
  payee: Payee
): Promise<PaymentResponse> {
  const data = {
    amount: Math.floor(amount * 100),
    payment_method: "pix",
    customer: {
      name: payee.name,
      email: payee.email,
    },
    pix: {
      expiration_date: new Date(Date.now() + 3600000).toISOString(), // 1 hora de validade
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

    const transaction = response.data;
    const qrCodePayload = transaction.pix.qr_code;
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodePayload);

    const responseData: PaymentResponse = {
      transaction: response.data,
      qrCodePayload,
      qrCodeDataUrl,
    };

    console.log("Transaction created: ", { ...responseData });
    return responseData;
  } catch (error) {
    console.error("Error creating PIX transaction:", error);
    throw new Error("PIX transaction failed");
  }
}

/**
 * Verifica o status de uma transação PIX no Pagar.me.
 *
 * @param {string} transactionId - O ID da transação.
 * @return {Promise<string>} O status da transação.
 */
export async function checkTransactionStatus(
  transactionId: string
): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.pagar.me/core/v5/transactions/${transactionId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": pagarMeApiKey,
        },
      }
    );

    return response.data.status;
  } catch (error) {
    console.error("Error checking transaction status:", error);
    throw new Error("Failed to check transaction status");
  }
}

export default createPixTransaction;
