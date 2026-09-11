/**
 * VeilPass — useMidnightWallet Hook
 *
 * React hook for managing the Midnight Lace wallet connection lifecycle.
 *
 * State machine:
 *   not-installed → (user installs Lace) → installed
 *   installed → connect() → connecting → connected | error
 *   connected → disconnect() → installed
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkWalletEnabled,
  connectLaceWallet,
  isLaceInstalled,
  MidnightWalletError,
  type ConnectedWalletAPI,
  type WalletState,
  type WalletStatus,
} from "../lib/midnight-wallet";

export interface UseMidnightWalletReturn {
  /** Current connection status. */
  status: WalletStatus;
  /** Wallet state (address, balances) — null when not connected. */
  walletState: WalletState | null;
  /** Connected wallet API — null when not connected. */
  walletApi: ConnectedWalletAPI | null;
  /** Human-readable error message. */
  error: string | null;
  /** Whether the Lace extension is installed in this browser. */
  isInstalled: boolean;
  /** Initiates the wallet connection flow. */
  connect: () => Promise<void>;
  /** Disconnects the wallet (clears local state). */
  disconnect: () => void;
  /** Clears any error. */
  clearError: () => void;
}

export function useMidnightWallet(): UseMidnightWalletReturn {
  const [status, setStatus] = useState<WalletStatus>("not-installed");
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [walletApi, setWalletApi] = useState<ConnectedWalletAPI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Use a ref so the connect callback always has fresh state
  const statusRef = useRef(status);
  statusRef.current = status;

  // On mount: detect wallet and attempt silent reconnection
  useEffect(() => {
    const init = async () => {
      const installed = isLaceInstalled();
      setIsInstalled(installed);

      if (!installed) {
        setStatus("not-installed");
        return;
      }

      setStatus("installed");

      // Attempt silent reconnection if previously authorized
      try {
        const enabled = await checkWalletEnabled();
        if (enabled) {
          const { api, state } = await connectLaceWallet();
          setWalletApi(api);
          setWalletState(state);
          setStatus("connected");
        }
      } catch {
        // Silent failure — user will connect manually
        setStatus("installed");
      }
    };

    void init();
  }, []);

  const connect = useCallback(async () => {
    if (statusRef.current === "connecting") return;

    setStatus("connecting");
    setError(null);

    try {
      const { api, state } = await connectLaceWallet();
      setWalletApi(api);
      setWalletState(state);
      setStatus("connected");
    } catch (err: unknown) {
      const message =
        err instanceof MidnightWalletError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Unexpected wallet error. Please try again.";

      setError(message);
      setStatus(isLaceInstalled() ? "installed" : "not-installed");
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletApi(null);
    setWalletState(null);
    setError(null);
    setStatus(isLaceInstalled() ? "installed" : "not-installed");
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    status,
    walletState,
    walletApi,
    error,
    isInstalled,
    connect,
    disconnect,
    clearError,
  };
}
