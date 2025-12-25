export {};

declare global {
  interface Window {
    /**
     * Interface exposed by Android WebView via MainActivity.
     * Ensure your Android code adds this JavascriptInterface.
     */
    AndroidBilling?: {
      upgradeToPremium: () => void;
      // Add other methods here if you expose them in Android
      // showToast?: (msg: string) => void;
    };

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
