export {};

declare global {
  interface Window {
    /**
     * Interface exposed by Android WebView via MainActivity.
     */
    AndroidBilling?: {
      /**
       * Triggers the purchase flow for a product.
       * @param productId The ID of the product (formerly SKU)
       */
      launchPurchaseFlow: (productId: string) => void;

      /**
       * (Optional) Fetch current price from Google Play.
       * If you implement this on Android, you can show localized prices.
       */
      queryProductDetails?: (productId: string) => void;

      /**
       * Legacy method - you should migrate to launchPurchaseFlow
       */
      upgradeToPremium: () => void;
    };

    /**
     * Callback triggered by Android with localized product info.
     */
    onProductDetailsReceived?: (detailsJson: string) => void;

    /**
     * Callback triggered by Android when a purchase is successful.
     */
    onPurchaseSuccess?: (purchaseToken: string) => void;

    /**
     * Callback triggered by Android when a purchase fails.
     */
    onPurchaseError?: (error: string) => void;
  }
}
