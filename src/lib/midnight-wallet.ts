/**
 * VeilPass — Wallet Integration Layer
 *
 * Supports Midnight Network wallets:
 * - Lace Wallet (window.midnight.mnLace)
 * - 1AM Wallet (window.midnight["1am"] / window.midnight.oneAM / window.oneAM)
 * - Sandbox ZK Wallet (Instant client-side keypair)
 */

export type WalletType = "lace" | "1am" | "sandbox";
export type NetworkId = "undeployed" | "preprod" | "mainnet";

export interface WalletInfo {
  id: WalletType;
  name: string;
  description: string;
  icon: string;
  installed: boolean;
  installUrl: string;
}

export interface WalletState {
  type: WalletType;
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
  submitTransaction?(tx: unknown): Promise<string>;
}

declare global {
  interface Window {
    midnight?: {
      mnLace?: MidnightWalletAPI;
      "1am"?: MidnightWalletAPI;
      oneAM?: MidnightWalletAPI;
      mn1am?: MidnightWalletAPI;
      [key: string]: MidnightWalletAPI | undefined;
    };
    oneAM?: MidnightWalletAPI;
  }
}

export const NETWORK_ID: NetworkId = (import.meta.env?.["VITE_NETWORK_ID"] as NetworkId) ?? "preprod";

// ─── Wallet Detection ─────────────────────────────────────────────────────────

export function isLaceInstalled(): boolean {
  return typeof window !== "undefined" && !!window.midnight?.mnLace;
}

export function is1AMInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    window.midnight?.["1am"] ||
    window.midnight?.oneAM ||
    window.midnight?.mn1am ||
    window.oneAM
  );
}

export function get1AMWallet(): MidnightWalletAPI | null {
  if (typeof window === "undefined") return null;
  return (
    window.midnight?.["1am"] ??
    window.midnight?.oneAM ??
    window.midnight?.mn1am ??
    window.oneAM ??
    null
  );
}

export function getLaceWallet(): MidnightWalletAPI | null {
  if (typeof window === "undefined") return null;
  return window.midnight?.mnLace ?? null;
}

export function getAvailableWallets(): WalletInfo[] {
  return [
    {
      id: "lace",
      name: "Lace Wallet",
      description: "Official Midnight Network Lace browser extension",
      icon: "lace",
      installed: isLaceInstalled(),
      installUrl: "https://www.lace.io",
    },
    {
      id: "1am",
      name: "1AM Wallet",
      description: "Community-driven Midnight privacy wallet",
      icon: "1am",
      installed: is1AMInstalled(),
      installUrl: "https://1am.xyz",
    },
    {
      id: "sandbox",
      name: "Sandbox ZK Wallet",
      description: "Instant in-browser ephemeral ZK keypair (No install required)",
      icon: "sandbox",
      installed: true,
      installUrl: "#",
    },
  ];
}

// ─── Connect Wallet ───────────────────────────────────────────────────────────

export async function connectWallet(type: WalletType): Promise<{
  api: ConnectedWalletAPI;
  state: WalletState;
}> {
  if (type === "lace") {
    const wallet = getLaceWallet();
    if (!wallet) {
      throw new Error("Lace wallet extension is not installed. Please install it or use Sandbox ZK Wallet.");
    }
    const connectedApi = await wallet.connect(NETWORK_ID);
    const wState = await connectedApi.state();
    return {
      api: connectedApi,
      state: {
        type: "lace",
        address: wState.address,
        displayAddress: shortenAddress(wState.address),
        balances: wState.balances ?? {},
        isConnected: true,
        networkId: NETWORK_ID,
      },
    };
  }

  if (type === "1am") {
    const wallet = get1AMWallet();
    if (!wallet) {
      throw new Error("1AM wallet extension is not installed. Please install it or use Sandbox ZK Wallet.");
    }
    const connectedApi = await wallet.connect(NETWORK_ID);
    const wState = await connectedApi.state();
    return {
      api: connectedApi,
      state: {
        type: "1am",
        address: wState.address,
        displayAddress: shortenAddress(wState.address),
        balances: wState.balances ?? {},
        isConnected: true,
        networkId: NETWORK_ID,
      },
    };
  }

  // Sandbox ZK Wallet (in-browser ephemeral keypair)
  const randomBytes = new Uint8Array(20);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0")).join("");
  const address = `mn1addr${hex}`;

  const mockApi: ConnectedWalletAPI = {
    state: async () => ({
      address,
      balances: { tNIGHT: 1000000000n, tDUST: 500000000n },
    }),
    submitTransaction: async () => {
      const txBytes = new Uint8Array(32);
      crypto.getRandomValues(txBytes);
      return Array.from(txBytes, (b) => b.toString(16).padStart(2, "0")).join("");
    },
  };

  return {
    api: mockApi,
    state: {
      type: "sandbox",
      address,
      displayAddress: shortenAddress(address),
      balances: { tNIGHT: 1000000000n, tDUST: 500000000n },
      isConnected: true,
      networkId: NETWORK_ID,
    },
  };
}

export function shortenAddress(address: string, start = 8, end = 4): string {
  if (!address || address.length <= start + end) return address;
  return `${address.slice(0, start)}…${address.slice(-end)}`;
}
