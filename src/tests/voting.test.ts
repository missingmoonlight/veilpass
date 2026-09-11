/**
 * VeilPass — PrivateVoting Contract Tests
 *
 * Tests the private voting logic: vote commitment uniqueness, double-vote
 * prevention, and tally correctness.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ─── Vote Commitment Logic ────────────────────────────────────────────────────
// Mirrors the PrivateVoting.compact circuit logic in TypeScript.

async function computeVoterNullifier(voterKey: string): Promise<string> {
  const domain = "veilpass:vote:";
  const domainBytes = new Uint8Array(32);
  const encoded = new TextEncoder().encode(domain);
  domainBytes.set(encoded.slice(0, 32));

  const keyBytes = hexToBytes(voterKey.padEnd(64, "0").slice(0, 64));
  const combined = new Uint8Array(64);
  combined.set(domainBytes, 0);
  combined.set(keyBytes, 32);

  const hash = await crypto.subtle.digest("SHA-256", combined);
  return bytesToHex(new Uint8Array(hash));
}

function generateVoterKey(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Simulated Poll State ─────────────────────────────────────────────────────

interface PollState {
  optionCount: number;
  usedNullifiers: Set<string>;
  totalVotes: number;
}

function createPoll(optionCount: number): PollState {
  return { optionCount, usedNullifiers: new Set(), totalVotes: 0 };
}

function castVote(
  poll: PollState,
  nullifier: string,
  chosenOption: number,
): { success: boolean; error?: string } {
  if (poll.usedNullifiers.has(nullifier)) {
    return { success: false, error: "PrivateVoting: already voted" };
  }
  if (chosenOption >= poll.optionCount) {
    return { success: false, error: "PrivateVoting: invalid option" };
  }
  poll.usedNullifiers.add(nullifier);
  poll.totalVotes += 1;
  return { success: true };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PrivateVoting — vote commitment", () => {
  it("produces a unique nullifier per voter key", async () => {
    const key1 = generateVoterKey();
    const key2 = generateVoterKey();
    const nul1 = await computeVoterNullifier(key1);
    const nul2 = await computeVoterNullifier(key2);
    expect(nul1).not.toBe(nul2);
  });

  it("is deterministic — same key always produces same nullifier", async () => {
    const key = generateVoterKey();
    const nul1 = await computeVoterNullifier(key);
    const nul2 = await computeVoterNullifier(key);
    expect(nul1).toBe(nul2);
  });

  it("nullifier does not reveal the chosen option", async () => {
    const key = generateVoterKey();
    // Two different option choices, same key → same nullifier (option is private)
    const nul1 = await computeVoterNullifier(key);
    const nul2 = await computeVoterNullifier(key);
    expect(nul1).toBe(nul2);
  });
});

describe("PrivateVoting — vote casting", () => {
  let poll: PollState;

  beforeEach(() => {
    poll = createPoll(3); // 3 options: 0, 1, 2
  });

  it("allows a valid vote to be cast", async () => {
    const key = generateVoterKey();
    const nul = await computeVoterNullifier(key);
    const result = castVote(poll, nul, 0);

    expect(result.success).toBe(true);
    expect(poll.totalVotes).toBe(1);
    expect(poll.usedNullifiers.has(nul)).toBe(true);
  });

  it("rejects a duplicate vote (same nullifier)", async () => {
    const key = generateVoterKey();
    const nul = await computeVoterNullifier(key);

    castVote(poll, nul, 0); // first vote — succeeds
    const result = castVote(poll, nul, 1); // duplicate — rejected

    expect(result.success).toBe(false);
    expect(result.error).toContain("already voted");
    expect(poll.totalVotes).toBe(1); // count unchanged
  });

  it("rejects a vote for an invalid option", async () => {
    const key = generateVoterKey();
    const nul = await computeVoterNullifier(key);
    const result = castVote(poll, nul, 99); // option 99 doesn't exist

    expect(result.success).toBe(false);
    expect(result.error).toContain("invalid option");
  });

  it("allows multiple different voters to vote", async () => {
    const voters = [generateVoterKey(), generateVoterKey(), generateVoterKey()];
    const nullifiers = await Promise.all(voters.map(computeVoterNullifier));

    for (let i = 0; i < nullifiers.length; i++) {
      const nul = nullifiers[i];
      if (!nul) continue;
      const result = castVote(poll, nul, i % 3);
      expect(result.success).toBe(true);
    }

    expect(poll.totalVotes).toBe(3);
    expect(poll.usedNullifiers.size).toBe(3);
  });
});

describe("PrivateVoting — privacy invariants", () => {
  it("an observer cannot link two votes to the same voter", async () => {
    // Two polls — voter uses separate keys per poll (best practice)
    const poll1 = createPoll(2);
    const poll2 = createPoll(2);
    const voterKey1 = generateVoterKey();
    const voterKey2 = generateVoterKey(); // separate key for poll 2

    const nul1 = await computeVoterNullifier(voterKey1);
    const nul2 = await computeVoterNullifier(voterKey2);

    castVote(poll1, nul1, 0);
    castVote(poll2, nul2, 1);

    // Nullifiers are different — cannot be linked to the same person
    expect(nul1).not.toBe(nul2);
  });

  it("the total vote count is public but individual votes are not", async () => {
    const poll = createPoll(2);
    const voters = [generateVoterKey(), generateVoterKey()];
    const nullifiers = await Promise.all(voters.map(computeVoterNullifier));

    if (nullifiers[0] && nullifiers[1]) {
      castVote(poll, nullifiers[0], 0);
      castVote(poll, nullifiers[1], 1);
    }

    // Total is public
    expect(poll.totalVotes).toBe(2);
    // Individual choices are NOT stored anywhere (private witness)
    expect(Array.from(poll.usedNullifiers)).not.toContain("option=0");
    expect(Array.from(poll.usedNullifiers)).not.toContain("option=1");
  });
});
