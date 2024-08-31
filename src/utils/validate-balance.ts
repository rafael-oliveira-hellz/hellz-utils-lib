/**
 * Verifica se o saldo da carteira é suficiente para realizar a transação.
 *
 * @param {number} balance - O saldo da carteira.
 * @param {number} amount - O valor a ser transferido.
 * @throws {Error} Se o saldo for insuficiente.
 */
export function validateWalletBalance(balance: number, amount: number): void {
  if (balance <= 0 || balance < amount) {
    throw new Error("Insufficient balance");
  }
}
