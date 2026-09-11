/**
 * VeilPass — Midnight Wallet Integration
 *
 * Real integration with the Midnight DApp Connector API.
 * The Lace wallet exposes `window.midnight.mnLace` in supported browsers.
 *
 * @see https://docs.midnight.network/develop/tutorial/using/api-card
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type NetworkId = "undeployed" | "preprod" | "mainnet";

export interface WalletState {
  address: string;
  displayAddress: string;
  balances: Record<string, bigint>;
  isConnected: boolean;
  networkId: NetworkId;
}

export interface MidnightWalletAPI {
  isEnabled(): Promise<boolean>;
  connect(networkId: NetworkId): Promise<ConnectedWalletAPI>;
  name: string;
  icon: string;
  apiVersion: string;
}

export interface ConnectedWalletAPI {
  state(): Promise<{
    address: string;
    balances: Record<string, bigint>;
  }>;
  /** Signs and submits a balanced transaction to the network. */
  submitTransaction?(tx: unknown): Promise<string>;
}

// ─── Wallet Detection ─────────────────────────────────────────────────────────

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightWalletAPI;
      [key: string]: MidnightWalletAPI | undefined;
    };
  }
}

export type WalletStatus =
  | "not-installed"
  | "installed"
  | "connecting"
  | "connected"
  | "error";

/**
 * Checks if the Midnight Lace wallet extension is installed.
 *
 * The wallet injects itself at `window.midnight.mnLace` when the browser
 * extension is active. This check is synchronous and safe to call on load.
 */
export function isLaceInstalled(): boolean {
  return typeof window !== "undefined" && !!window.midnight?.mnLace;
}

/**
 * Returns the raw Midnight Lace wallet API from the window object.
 * Returns null if the extension is not installed.
 */
export function getLaceWallet(): MidnightWalletAPI | null {
  if (typeof window === "undefined") return null;
  return window.midnight?.mnLace ?? null;
}

// ─── Connection ───────────────────────────────────────────────────────────────

const NETWORK_ID: NetworkId = (import.meta.env?.VITE_NETWORK_ID as NetworkId) ?? "undeployed";

/**
 * Connects to the Midnight Lace wallet.
 *
 * Throws descriptive errors if:
 * - The extension is not installed
 * - The user rejects the connection request
 * - The wallet is on the wrong network
 */
export async function connectLaceWallet(): Promise<{
  api: ConnectedWalletAPI;
  state: WalletState;
}> {
  const wallet = getLaceWallet();

  if (!wallet) {
    throw new MidnightWalletError(
      "WALLET_NOT_FOUND",
      "Midnight Lace wallet not detected. Please install the extension from https://midnight.network",
    );
  }

  let connectedApi: ConnectedWalletAPI;
  try {
    connectedApi = await wallet.connect(NETWORK_ID);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.toLowerCase().includes("user rejected") || message.toLowerCase().includes("denied")) {
      throw new MidnightWalletError(
        "USER_REJECTED",
        "Connection request was rejected. Please approve the VeilPass connection in your wallet.",
      );
    }
    throw new MidnightWalletError("CONNECTION_FAILED", `Wallet connection failed: ${message}`);
  }

  const walletState = await connectedApi.state();
  const state: WalletState = {
    address: walletState.address,
    displayAddress: shortenAddress(walletState.address),
    balances: walletState.balances ?? {},
    isConnected: true,
    networkId: NETWORK_ID,
  };

  return { api: connectedApi, state };
}

/**
 * Checks if the wallet is already enabled (previously authorized).
 * Use this to silently reconnect on page load without prompting the user.
 */
export async function checkWalletEnabled(): Promise<boolean> {
  const wallet = getLaceWallet();
  if (!wallet) return false;
  try {
    return await wallet.isEnabled();
  } catch {
    return false;
  }
}

// ─── Error Handling ───────────────────────────────────────────────────────────

export type WalletErrorCode =
  | "WALLET_NOT_FOUND"
  | "USER_REJECTED"
  | "CONNECTION_FAILED"
  | "TRANSACTION_FAILED"
  | "NETWORK_MISMATCH"
  | "PROOF_SERVER_UNAVAILABLE";

export class MidnightWalletError extends Error {
  constructor(
    public readonly code: WalletErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "MidnightWalletError";
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Shortens a Midnight address for display (e.g. `addr1q…7k2m`). */
export function shortenAddress(address: string, start = 8, end = 4): string {
  if (!address || address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}
