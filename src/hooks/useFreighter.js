import { useState, useEffect, useCallback } from 'react';
import { MESSAGES } from '../config/constants';

/**
 * Hook for Freighter wallet integration
 * @returns {Object} - Wallet state and actions
 */
export const useFreighter = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);

  // Check if Freighter is installed on mount
  useEffect(() => {
    const checkInstallation = async () => {
      try {
        const { isAllowed } = await import('@stellar/freighter-api');
        const allowed = await isAllowed();
        setIsInstalled(true);

        if (allowed) {
          setIsConnected(true);
          const { getAddress } = await import('@stellar/freighter-api');
          const key = await getAddress();
          setPublicKey(key);
        }
      } catch (err) {
        setIsInstalled(false);
        setError(MESSAGES.WALLET_NOT_INSTALLED);
      }
    };

    checkInstallation();
  }, []);

  /**
   * Connect to Freighter wallet
   */
  const connect = useCallback(async () => {
    setError(null);
    try {
      const { connect: freighterConnect, getPublicKey: freighterGetKey } = await import('@stellar/freighter-api');

      await freighterConnect();
      const key = await freighterGetKey();

      setIsConnected(true);
      setPublicKey(key);
      setIsInstalled(true);

      return { success: true, publicKey: key };
    } catch (err) {
      if (err.message?.includes('User denied') || err.message?.includes('rejected')) {
        setError(MESSAGES.TRANSACTION_REJECTED);
      } else {
        setError(MESSAGES.WALLET_NOT_CONNECTED);
      }
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Send payment via Freighter
   * @param {string} destination - Recipient address
   * @param {number} amount - Amount in XLM
   * @param {Function} buildTxFn - Function to build the transaction
   * @returns {Promise<Object>} - Transaction result
   */
  const sendPayment = useCallback(async (destination, amount, buildTxFn) => {
    setError(null);

    if (!isConnected) {
      const connectResult = await connect();
      if (!connectResult.success) {
        return connectResult;
      }
    }

    try {
      const result = await buildTxFn(publicKey);
      return result;
    } catch (err) {
      if (err.message?.includes('User denied') || err.message?.includes('rejected')) {
        setError(MESSAGES.TRANSACTION_REJECTED);
      } else if (err.message?.includes('not installed')) {
        setError(MESSAGES.WALLET_NOT_INSTALLED);
      } else {
        setError(err.message || MESSAGES.TRANSACTION_ERROR);
      }
      return { success: false, error: err.message };
    }
  }, [isConnected, publicKey, connect]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    setIsConnected(false);
    setPublicKey(null);
    setError(null);
  }, []);

  return {
    isInstalled,
    isConnected,
    publicKey,
    error,
    connect,
    disconnect,
    sendPayment,
    clearError: () => setError(null),
  };
};
