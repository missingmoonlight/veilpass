/**
 * VeilPass — AgeGate Contract Tests
 *
 * Tests the core ZK proof logic, nullifier computation, and wallet detection.
 * These run entirely in Node.js using the Web Crypto polyfill.
 *
 * Run with: bun test (or vitest)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  computeNullifier,
  generateSecretKey,
  generateAgeProof,
  getLedgerState,
  recordVerification,
  isNullifierUsed,
  CURRENT_YEAR,
  MIN_AGE,
} from "../../contracts/managed-api";

// ─── Nullifier Tests ──────────────────────────────────────────────────────────

describe("computeNullifier", () => {
  it("produces a 64-character hex string", async () => {
    const key = "a".repeat(64);
    const nul = await computeNullifier(key);
    expect(nul).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic — same key always produces same nullifier", async () => {
    const key = generateSecretKey();
    const nul1 = await computeNullifier(key);
    const nul2 = await computeNullifier(key);
    expect(nul1).toBe(nul2);
  });

  it("produces different nullifiers for different keys", async () => {
    const key1 = generateSecretKey();
    const key2 = generateSecretKey();
    const nul1 = await computeNullifier(key1);
    const nul2 = await computeNullifier(key2);
    expect(nul1).not.toBe(nul2);
  });
});

// ─── Secret Key Tests ─────────────────────────────────────────────────────────

describe("generateSecretKey", () => {
  it("generates a 64-character hex string", () => {
    const key = generateSecretKey();
    expect(key).toMatch(/^[0-9a-f]{64}$/);
  });

  it("generates unique keys on each call", () => {
    const key1 = generateSecretKey();
    const key2 = generateSecretKey();
    expect(key1).not.toBe(key2);
  });
});

// ─── Age Proof Tests ──────────────────────────────────────────────────────────

describe("generateAgeProof", () => {
  const validBirthYear = CURRENT_YEAR - 25; // 25 years old — clearly valid

  it("accepts a valid birth year and returns a proof", async () => {
    const key = generateSecretKey();
    const result = await generateAgeProof(validBirthYear, key);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
    expect(result.nullifier).toMatch(/^[0-9a-f]{64}$/);
    expect(result.referenceYear).toBe(CURRENT_YEAR);
    expect(result.minAge).toBe(MIN_AGE);
  });

  it("rejects a birth year that makes the user underage", async () => {
    const underageBirthYear = CURRENT_YEAR - (MIN_AGE - 1); // one year too young
    const key = generateSecretKey();
    const result = await generateAgeProof(underageBirthYear, key);

    expect(result.isValid).toBe(false);
    expect(result.nullifier).toBe("");
    expect(result.error).toContain("minimum age not met");
  });

  it("rejects a future birth year", async () => {
    const futureBirthYear = CURRENT_YEAR + 1;
    const key = generateSecretKey();
    const result = await generateAgeProof(futureBirthYear, key);

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("invalid birth year");
  });

  it("accepts a birth year of exactly MIN_AGE years ago", async () => {
    const exactBirthYear = CURRENT_YEAR - MIN_AGE;
    const key = generateSecretKey();
    const result = await generateAgeProof(exactBirthYear, key);

    expect(result.isValid).toBe(true);
  });

  it("the nullifier is derived from the secret key, not the birth year", async () => {
    const key = generateSecretKey();
    const result1 = await generateAgeProof(validBirthYear, key);
    const result2 = await generateAgeProof(validBirthYear - 1, key);
    // Same key → same nullifier (birth year is private, not encoded in nullifier)
    expect(result1.nullifier).toBe(result2.nullifier);
  });
});

// ─── Ledger State Tests ───────────────────────────────────────────────────────

describe("Ledger state management", () => {
  // Provide a fresh in-memory localStorage before each test
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};
    const mock = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
      key: (i: number) => Object.keys(store)[i] ?? null,
      get length() { return Object.keys(store).length; },
    };
    // Assign to both global and globalThis for Node compat
    (globalThis as unknown as Record<string, unknown>)["localStorage"] = mock;
  });

  it("starts with a verified count of 0", () => {
    const state = getLedgerState();
    expect(state.verifiedCount).toBe(0);
    expect(state.usedNullifiers).toHaveLength(0);
  });

  it("records a verification and increments the count", async () => {
    const key = generateSecretKey();
    const nullifier = await computeNullifier(key);
    recordVerification(nullifier);

    const state = getLedgerState();
    expect(state.verifiedCount).toBe(1);
    expect(state.usedNullifiers).toContain(nullifier);
  });

  it("detects a used nullifier", async () => {
    const key = generateSecretKey();
    const nullifier = await computeNullifier(key);

    expect(isNullifierUsed(nullifier)).toBe(false);
    recordVerification(nullifier);
    expect(isNullifierUsed(nullifier)).toBe(true);
  });

  it("accumulates multiple verifications correctly", async () => {
    const keys = [generateSecretKey(), generateSecretKey(), generateSecretKey()];
    const nullifiers = await Promise.all(keys.map(computeNullifier));

    for (const nul of nullifiers) {
      recordVerification(nul);
    }

    const state = getLedgerState();
    expect(state.verifiedCount).toBe(3);
    expect(state.usedNullifiers).toHaveLength(3);
  });
});

// ─── Wallet Detection Tests ───────────────────────────────────────────────────

describe("Wallet detection", () => {
  it("detects when Lace wallet is not installed", async () => {
    vi.stubGlobal("window", { midnight: undefined });
    const { isLaceInstalled } = await import("../lib/midnight-wallet");
    expect(isLaceInstalled()).toBe(false);
  });

  it("detects when Lace wallet is installed", async () => {
    const mockWallet = {
      isEnabled: vi.fn().mockResolvedValue(true),
      connect: vi.fn(),
      name: "Lace",
      icon: "",
      apiVersion: "4.0.0",
    };
    vi.stubGlobal("window", { midnight: { mnLace: mockWallet } });
    const { isLaceInstalled } = await import("../lib/midnight-wallet");
    expect(isLaceInstalled()).toBe(true);
  });

  it("returns null from getLaceWallet when not installed", async () => {
    vi.stubGlobal("window", {});
    const { getLaceWallet } = await import("../lib/midnight-wallet");
    expect(getLaceWallet()).toBeNull();
  });
});

// ─── Privacy Invariant Tests ──────────────────────────────────────────────────

describe("Privacy invariants", () => {
  it("the nullifier does not reveal the birth year", async () => {
    const key = generateSecretKey();
    // Generate proofs for very different birth years
    const proof1990 = await generateAgeProof(CURRENT_YEAR - 34, key);
    const proof2000 = await generateAgeProof(CURRENT_YEAR - 24, key);

    // Nullifiers are identical — an observer cannot tell ages apart
    expect(proof1990.nullifier).toBe(proof2000.nullifier);

    // The proof itself only asserts age >= MIN_AGE, nothing more specific
    expect(proof1990.isValid).toBe(true);
    expect(proof2000.isValid).toBe(true);
  });

  it("different users produce different nullifiers for same birth year", async () => {
    const birthYear = CURRENT_YEAR - 30;
    const key1 = generateSecretKey();
    const key2 = generateSecretKey();

    const proof1 = await generateAgeProof(birthYear, key1);
    const proof2 = await generateAgeProof(birthYear, key2);

    // Same birth year, different users → different nullifiers (unlinkable)
    expect(proof1.nullifier).not.toBe(proof2.nullifier);
  });
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() { return Object.keys(store).length; },
  };
}
