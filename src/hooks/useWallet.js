import { useState, useEffect, useCallback, useRef } from 'react';
import { StellarWalletsKit, KitEventType } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { WalletConnectModule, WalletConnectTargetChain } from '@creit.tech/stellar-wallets-kit/modules/wallet-connect';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { MESSAGES, NETWORK_PASSPHRASE, WALLETCONNECT_PROJECT_ID, STELLAR_NETWORK } from '../config/constants';

/**
 * Initialise the kit once (module-level singleton).
 * We lazy-init on first use so SSR / non-browser envs don't crash.
 */
let _kit = null;

const getKit = () => {
  if (_kit) return _kit;

  const wcChain =
    STELLAR_NETWORK === 'PUBLIC'
      ? WalletConnectTargetChain.PUBLIC
      : WalletConnectTargetChain.TESTNET;

  StellarWalletsKit.init({
    network: NETWORK_PASSPHRASE,
    selectedModuleId: FreighterModule.productId,
    modules: [
      new FreighterModule(),
      new LobstrModule(),
      new xBullModule(),
      new WalletConnectModule({
        projectId: WALLETCONNECT_PROJECT_ID,
        metadata: {
          name: 'Stralio',
          description: 'Donate via the Stellar network',
          url: window.location.origin,
          icons: [`${window.location.origin}/favicon.ico`],
        },
        allowedChains: [wcChain],
      }),
    ],
  });

  _kit = StellarWalletsKit;
  return _kit;
};

/**
 * Hook for multi-wallet Stellar integration via stellar-wallets-kit.
 * Works on desktop (Freighter extension, Lobstr, xBull) and mobile
 * (Freighter mobile, Lobstr mobile, any WalletConnect-compatible wallet).
 */
export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);
  const unsubRef = useRef(null);

  // Listen for kit state changes (connect / disconnect / address update)
  useEffect(() => {
    const kit = getKit();

    const unsub = kit.on(KitEventType.STATE_UPDATED, (event) => {
      const addr = event.payload?.address;
      if (addr) {
        setPublicKey(addr);
        setIsConnected(true);
      } else {
        setPublicKey(null);
        setIsConnected(false);
      }
    });

    unsubRef.current = unsub;
    return () => unsub?.();
  }, []);

  /**
   * Open the wallet-selection modal.
   * On desktop the user picks their extension wallet.
   * On mobile a QR / deep-link is shown for WalletConnect wallets.
   */
  const connect = useCallback(async () => {
    setError(null);
    try {
      const kit = getKit();
      const { address } = await kit.authModal();
      setPublicKey(address);
      setIsConnected(true);
      return { success: true, publicKey: address };
    } catch (err) {
      const msg =
        err?.message?.includes('User denied') || err?.message?.includes('rejected')
          ? MESSAGES.TRANSACTION_REJECTED
          : MESSAGES.WALLET_NOT_CONNECTED;
      setError(msg);
      return { success: false, error: err?.message };
    }
  }, []);

  /**
   * Sign an already-prepared XDR string via the active wallet module.
   * Returns { signedTxXdr } on success.
   */
  const signTransaction = useCallback(
    async (xdr) => {
      if (!isConnected || !publicKey) {
        const result = await connect();
        if (!result.success) throw new Error(MESSAGES.WALLET_NOT_CONNECTED);
      }

      const kit = getKit();
      const { signedTxXdr } = await kit.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASSPHRASE,
        address: publicKey,
      });

      if (!signedTxXdr) throw new Error('Transaction rejected by user');
      return signedTxXdr;
    },
    [isConnected, publicKey, connect]
  );

  const disconnect = useCallback(async () => {
    try {
      const kit = getKit();
      await kit.disconnect();
    } catch (_) {
      // ignore disconnect errors
    }
    setIsConnected(false);
    setPublicKey(null);
    setError(null);
  }, []);

  return {
    isConnected,
    publicKey,
    error,
    connect,
    disconnect,
    signTransaction,
    clearError: () => setError(null),
  };
};
