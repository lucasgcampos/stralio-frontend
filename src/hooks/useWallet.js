import { useState, useEffect, useCallback, useRef } from 'react';
import { StellarWalletsKit, KitEventType } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { WalletConnectModule, WalletConnectTargetChain, WALLET_CONNECT_ID } from '@creit.tech/stellar-wallets-kit/modules/wallet-connect';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { MESSAGES, NETWORK_PASSPHRASE, WALLETCONNECT_PROJECT_ID, STELLAR_NETWORK } from '../config/constants';

/**
 * Returns true when the page is being viewed on a mobile/tablet device.
 * Extension wallets (Freighter, Lobstr, xBull) are never available here,
 * so we skip the generic modal and go straight to WalletConnect.
 */
const isMobile = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

/**
 * Initialise the kit once (module-level singleton).
 * Lazy-init so SSR / non-browser envs don't crash.
 */
let _kit = null;

const getKit = () => {
  if (_kit) return _kit;

  const wcChain =
    STELLAR_NETWORK === 'PUBLIC'
      ? WalletConnectTargetChain.PUBLIC
      : WalletConnectTargetChain.TESTNET;

  // On mobile we default to WalletConnect; on desktop to Freighter extension.
  const defaultModuleId = isMobile() ? WALLET_CONNECT_ID : FreighterModule.productId;

  StellarWalletsKit.init({
    network: NETWORK_PASSPHRASE,
    selectedModuleId: defaultModuleId,
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
   * Connect to a wallet.
   *
   * - Desktop: opens the kit's authModal so the user can pick any extension wallet.
   * - Mobile: skips the generic modal, activates WalletConnect directly and opens
   *   the Reown AppKit modal which only lists mobile-compatible wallets (Freighter
   *   app, Lobstr app, etc.) via QR code / deep link.
   */
  const connect = useCallback(async () => {
    setError(null);
    try {
      const kit = getKit();
      let address;

      if (isMobile()) {
        // Force WalletConnect as the active module and fetch address,
        // which triggers the WalletConnect / Reown AppKit modal.
        kit.setWallet(WALLET_CONNECT_ID);
        ({ address } = await kit.getAddress());
      } else {
        // Desktop: show the full wallet-selection modal.
        ({ address } = await kit.authModal());
      }

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
