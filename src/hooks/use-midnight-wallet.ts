/**
 * VeilPass — useMidnightWallet Hook
 *
 * React hook supporting Lace Wallet, 1AM Wallet, and Sandbox ZK Wallet.
 */

import { useCallback, useEffect, useState } from "react";
import {
  connectWallet as connectWalletApi,
  getAvailableWallets,
  is1AMInstalled,
  isLaceInstalled,
  type ConnectedWalletAPI,
  type WalletInfo,
  type WalletState,
  type WalletType,
} from "../lib/midnight-wallet";

export interface UseMidnightWalletReturn {
  walletState: WalletState | null;
  walletApi: ConnectedWalletAPI | null;
  error: string | null;
  isConnecting: boolean;
  availableWallets: WalletInfo[];
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

export function useMidnightWallet(): UseMidnightWalletReturn {
  const [walletState, setWalletState] = useState<WalletState | null>(null);
  const [walletApi, setWalletApi] = useState<ConnectedWalletAPI | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    setAvailableWallets(getAvailableWallets());
  }, []);

  const connect = useCallback(async (type: WalletType) => {
    setIsConnecting(true);
    setError(null);
    try {
      const { api, state } = await connectWalletApi(type);
      setWalletApi(api);
      setWalletState(state);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWalletApi(null);
    setWalletState(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    walletState,
    walletApi,
    error,
    isConnecting,
    availableWallets,
    connect,
    disconnect,
    clearError,
  };
}
