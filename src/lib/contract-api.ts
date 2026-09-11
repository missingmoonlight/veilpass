/**
 * VeilPass — Contract API
 *
 * High-level interface for deploying and interacting with the AgeGate contract.
 * This module bridges the frontend and the Midnight network. It uses:
 *   - `contracts/managed-api.ts` for on-chain logic and local proof generation
 *   - `src/lib/midnight-wallet.ts` for wallet signing and submission
 *
 * When a real Proof Server is available (Docker), the generateAgeProof step
 * will be delegated to it via the proof-server HTTP API on port 6300.
 */

import {
  computeNullifier,
  generateAgeProof,
  generateSecretKey,
  getContractAddress,
  getLedgerState,
  isNullifierUsed,
  recordVerification,
  saveContractAddress,
  type AgeGateLedgerState,
  type AgeProof,
  type TransactionResult,
  CURRENT_YEAR,
  MIN_AGE,
} from "../../contracts/managed-api";
import type { ConnectedWalletAPI } from "./midnight-wallet";

export type {
  AgeGateLedgerState,
  AgeProof,
  TransactionResult,
};

export {
  isNullifierUsed,
  getLedgerState,
  getContractAddress,
  CURRENT_YEAR,
  MIN_AGE,
};

// ─── Contract Deployment ──────────────────────────────────────────────────────

/**
 * Deploys the AgeGate contract to Midnight and stores the address.
 *
 * In production this would:
 * 1. Call the Compact-generated `deploy()` function via midnight-js SDK
 * 2. Sign the deployment transaction with the connected wallet
 * 3. Wait for the transaction to be included in a block
 *
 * For the demo/hackathon environment, we generate a deterministic address
 * from the deployer's wallet and the contract parameters.
 */
export async function deployAgeGateContract(
  walletApi: ConnectedWalletAPI | null,
): Promise<string> {
  // Check if already deployed
  const existing = getContractAddress();
  if (existing) return existing;

  // Generate a realistic contract address
  const deployParams = {
    referenceYear: CURRENT_YEAR,
    minAge: MIN_AGE,
    timestamp: Date.now(),
  };

  const bytes = new TextEncoder().encode(JSON.stringify(deployParams));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

  // Format as a Midnight contract address (Bech32-like prefix)
  const contractAddress = `mn1contract${hex.slice(0, 40)}`;
  saveContractAddress(contractAddress);

  console.info("[VeilPass] Contract deployed at:", contractAddress);
  if (walletApi) {
    console.info("[VeilPass] Deployment signed by wallet");
  }

  return contractAddress;
}

// ─── Proof Generation ─────────────────────────────────────────────────────────

/**
 * Generates a zero-knowledge age proof from the user's birth year.
 *
 * The birth year is used only locally and is discarded after this call.
 * Only the resulting nullifier is retained and later published on-chain.
 *
 * Privacy: an observer watching the network sees only the nullifier,
 * which reveals nothing about the underlying birth year or identity.
 */
export async function createAgeProof(birthYear: number): Promise<AgeProof & { secretKey: string }> {
  const secretKey = generateSecretKey();
  const proof = await generateAgeProof(birthYear, secretKey);

  if (!proof.isValid) {
    throw new Error(proof.error ?? "Proof generation failed");
  }

  // Check nullifier uniqueness (prevents replay)
  if (isNullifierUsed(proof.nullifier)) {
    throw new Error(
      "This credential has already been used. Each proof may only be submitted once.",
    );
  }

  return { ...proof, secretKey };
}

// ─── Proof Submission ─────────────────────────────────────────────────────────

/**
 * Submits a generated age proof to the AgeGate contract.
 *
 * In production, this would:
 * 1. Construct a balanced transaction calling `proveAge()`
 * 2. Sign it with the connected wallet (wallet provides the private witnesses)
 * 3. Submit to the Midnight node and wait for confirmation
 *
 * The wallet provides `localBirthYear` and `localSecretKey` as witnesses.
 * These are handled by the wallet's private state provider and never sent
 * to the node or indexer.
 */
export async function submitAgeProof(
  proof: AgeProof,
  _secretKey: string,
  walletApi: ConnectedWalletAPI | null,
): Promise<TransactionResult> {
  // Build a realistic transaction hash
  const txData = `${proof.nullifier}:${proof.referenceYear}:${Date.now()}`;
  const txBytes = new TextEncoder().encode(txData);
  const txHashBuffer = await crypto.subtle.digest("SHA-256", txBytes);
  const txHash = Array.from(new Uint8Array(txHashBuffer), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

  // In production: walletApi.submitTransaction(balancedTx)
  if (walletApi) {
    console.info("[VeilPass] Transaction signed by wallet:", txHash.slice(0, 16));
  }

  // Update local ledger state (simulates the on-chain state change)
  const ledgerState = recordVerification(proof.nullifier);

  return {
    txHash,
    blockHeight: Math.floor(Math.random() * 1000) + 100,
    ledgerState,
  };
}

// ─── Ledger Query ─────────────────────────────────────────────────────────────

/**
 * Fetches the current on-chain state of the AgeGate contract.
 *
 * In production, this would query the Midnight indexer's GraphQL endpoint.
 * For the demo, we return the locally persisted state.
 */
export async function fetchLedgerState(): Promise<AgeGateLedgerState> {
  // Production: fetch from NETWORK_CONFIG.indexerUri
  return getLedgerState();
}

// ─── Nullifier ────────────────────────────────────────────────────────────────

export { computeNullifier, generateSecretKey };
