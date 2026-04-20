// Donation limits
export const MIN_DONATION = 2;
export const MAX_DONATION = 10000;

// Field limits
export const USERNAME_MAX_LENGTH = 30;
export const MESSAGE_MAX_LENGTH = 200;

// Recipient address (from environment variable with fallback)
export const RECIPIENT_ADDRESS = import.meta.env.VITE_RECIPIENT_ADDRESS || 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// Stellar network
// export const STELLAR_NETWORK = 'PUBLIC';
export const STELLAR_NETWORK = 'TESTNET';
export const LUMENS = 10000000; // 1 XLM = 10^7 stroops

// UI messages
export const MESSAGES = {
  WALLET_NOT_INSTALLED: 'Freighter Wallet is not installed. Please install it from the Chrome Web Store.',
  WALLET_NOT_CONNECTED: 'Please unlock your Freighter Wallet to continue.',
  TRANSACTION_REJECTED: 'Transaction was rejected. Please try again.',
  TRANSACTION_SUCCESS: 'Donation sent successfully! View on StellarExpert:',
  TRANSACTION_ERROR: 'Transaction failed. Please try again.',
  VALIDATION_ERROR: 'Please correct the errors in the form.',
};
