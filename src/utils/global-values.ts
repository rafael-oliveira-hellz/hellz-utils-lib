class GlobalValues {
  private static instance: GlobalValues;
  private masterPrivateKey: string | null = null;
  private privateKeyWIF: string | null = null;
  private primaryWalletAddress: string | null = null;

  private constructor() {}

  /**
   * Retrieves the singleton instance of GlobalValues.
   *
   * @return {GlobalValues} The singleton instance of GlobalValues
   */
  public static getInstance(): GlobalValues {
    if (!GlobalValues.instance) {
      GlobalValues.instance = new GlobalValues();
    }
    return GlobalValues.instance;
  }

  /**
   * Sets the master private key.
   *
   * @param {string} key - The master private key to set.
   * @return {void}
   */
  public setMasterPrivateKey(key: string): void {
    this.masterPrivateKey = key;
  }

  /**
   * Retrieves the master private key.
   *
   * @return {string | null} The master private key value
   */
  public getMasterPrivateKey(): string | null {
    return this.masterPrivateKey;
  }

  /**
   * Sets the private key WIF.
   *
   * @param {string} key - The private key WIF to set.
   * @return {void}
   */
  public setPrivateKeyWIF(key: string): void {
    this.privateKeyWIF = key;
  }

  /**
   * Retrieves the private key WIF.
   *
   * @return {string | null} The private key WIF value
   */
  public getPrivateKeyWIF(): string | null {
    return this.privateKeyWIF;
  }

  /**
   * Sets the primary wallet address.
   *
   * @param {string} address - The primary wallet address to set.
   * @return {void}
   */
  public setPrimaryWalletAddress(address: string): void {
    this.primaryWalletAddress = address;
  }

  /**
   * Retrieves the primary wallet address.
   *
   * @return {string | null} The primary wallet address value
   */
  public getPrimaryWalletAddress(): string | null {
    return this.primaryWalletAddress;
  }
}

export default GlobalValues;
