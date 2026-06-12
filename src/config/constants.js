import { Networks } from '@stellar/stellar-sdk';

// Donation limits
export const MIN_DONATION = 2;
export const MAX_DONATION = 10000;

// Field limits
export const USERNAME_MAX_LENGTH = 30;
export const MESSAGE_MAX_LENGTH = 200;

// Recipient address (from environment variable with fallback)
export const STRALIO_CONTRACT_ID = import.meta.env.VITE_STRALIO_CONTRACT_ID || 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// Stellar network
export const LUMENS = 10000000; // 1 XLM = 10^7 stroops
export const STELLAR_NETWORK = 'TESTNET';
export const XML_CONTRACT_ID = STELLAR_NETWORK === 'PUBLIC' ? 'CXXX' : 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
export const HORIZON_SERVER_URL = STELLAR_NETWORK === 'PUBLIC' ? 'https://horizon.stellar.org' : 'https://horizon-testnet.stellar.org';
export const RPC_SOROBAN_URL = STELLAR_NETWORK === 'PUBLIC' ? 'https://soroban.stellar.org' : 'https://soroban-testnet.stellar.org';
export const NETWORK_PASSPHRASE = STELLAR_NETWORK === 'PUBLIC' ? Networks.PUBLIC : Networks.TESTNET;

// WalletConnect project ID (from WalletConnect Cloud)
export const WALLETCONNECT_PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'none';

// UI messages
export const MESSAGES = {
  WALLET_NOT_CONNECTED: 'No wallet connected. Click "Connect Wallet" to continue.',
  TRANSACTION_REJECTED: 'Transaction was rejected. Please try again.',
  TRANSACTION_SUCCESS: 'Donation sent successfully! View on StellarExpert:',
  TRANSACTION_ERROR: 'Transaction failed. Please try again.',
  VALIDATION_ERROR: 'Please correct the errors in the form.',
};
