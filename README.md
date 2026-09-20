# VeilPass — Private Age / Eligibility Gate

<div align="center">

[![CI](https://github.com/missingmoonlight/veilpass/actions/workflows/ci.yml/badge.svg)](https://github.com/missingmoonlight/veilpass/actions/workflows/ci.yml)
[![Built with Midnight](https://img.shields.io/badge/Built%20with-Midnight%20Network-6C47FF?style=flat)](https://midnight.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Prove you meet an age threshold. Keep your birth year private.**

[Live Demo](https://veilpass-omega.vercel.app/) · [Compact Contracts](./contracts/) · [CI/CD](https://github.com/missingmoonlight/veilpass/actions)

</div>

---

## ⚡ Midnight Compact Circuit Compilation Proof

Terminal output verifying successful `AgeGate.compact` compilation and generated circuits via Compact compiler (`compact 0.5.2`):

![Midnight Compact Circuit Compilation](public/screenshots/compact_compile.png)

* **`proveAge`** (`k=13, rows=4238`): Evaluates `age >= minAge` in zero-knowledge using private witness birth year.
* **`isNullifierUsed`** (`k=9, rows=305`): Validates uniqueness of 32-byte cryptographic nullifier on the Midnight ledger.

---

## 🚀 Live Deployed Contract on Midnight Network

| Parameter | Details |
|---|---|
| **Contract Name** | `AgeGate` (`contracts/AgeGate.compact`) |
| **Deployed Contract Address** | [`020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586`](https://preprod.midnightexplorer.com/contracts/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586) |
| **Transaction Hash** | `0x01a4369fd6ce11216fbc409e94f45af601332291d21c8395128e88553254c828` |
| **Block Height** | `1843092` |
| **Network** | **Midnight Preprod Testnet** |
| **Explorer Link** | [🔎 View Contract on Midnight Preprod Explorer](https://preprod.midnightexplorer.com/contracts/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586) |
| **ZK Circuits Verified** | `proveAge` (4,238 rows), `isNullifierUsed` (305 rows) |

---

## What is VeilPass?

### Product Proposal & Selected Idea
- **Track**: **Age / Eligibility Gate** *(from the official Midnight Idea List: "prove a threshold without revealing the underlying value")*
- **Problem**: Age verification online conventionally forces users to disclose sensitive personal identifiable information (PII) — full birth dates, government ID scans, or biometric data — exposing them to identity theft and centralized data breaches.
- **Solution**: VeilPass implements a zero-knowledge credential flow where the user proves they satisfy an age gate (`age >= minAge`) using local zero-knowledge proof generation. The actual birth year is consumed purely as an in-memory private witness and is never transmitted.

---

## Privacy Model

### Public State vs. Private Witnesses

Midnight smart contracts partition application state into **public ledger state** (globally visible and verified by consensus) and **private witnesses** (held strictly on the client/wallet and discarded after local proof generation):

| Component | Storage Location | Visibility | Purpose |
|---|---|---|---|
| **`localBirthYear`** | Local Wallet / Client | 🔒 **Private Witness** | Private input supplying the user's birth year. Evaluated inside the ZK circuit; never broadcast. |
| **`localSecretKey`** | Local Wallet / Client | 🔒 **Private Witness** | Random session entropy ensuring nullifiers cannot be brute-forced or linked across dApps. |
| **`minAge`** | On-Chain Ledger | 🌐 **Public Ledger State** | Configured age threshold (e.g. `18`). |
| **`referenceYear`** | On-Chain Ledger | 🌐 **Public Ledger State** | Contract reference epoch (e.g. `2026`) against which age is computed. |
| **`usedNullifiers`** | On-Chain Ledger | 🌐 **Public Ledger State** | Set of consumed 32-byte cryptographic hashes preventing replay attacks. |
| **`verifiedCount`** | On-Chain Ledger | 🌐 **Public Ledger State** | Verifiable public tally of total successful gate passes. |

### What an Observer Can and Cannot Learn

> **What an observer CAN learn:**
> - That *some* user passed the 18+ check (a nullifier was recorded)
> - The total number of successful verifications (`verifiedCount` on the ledger)
> - The policy parameters: `referenceYear` and `minAge` (public, set at deploy time)
> - The one-time nullifier — proves uniqueness but reveals nothing about the user

> **What an observer CANNOT learn:**
> - The user's birth year
> - The user's exact age
> - Whether two different proofs belong to the same person (nullifiers are derived from a per-session secret key, not from identity)
> - Any relationship between the nullifier and the birth year

### Zero-Knowledge Dataflow

```
User's device (Local Wallet)       Compact Circuit (Midnight Ledger)
────────────────────────────       ─────────────────────────────────
localBirthYear ──┐                 assert (referenceYear - birthYear) >= minAge
localSecretKey ──┤  ZK Proof  →   assert !usedNullifiers.member(nullifier)
                 └─ (private)      insert nullifier into usedNullifiers
                                   increment verifiedCount
                                   ← Status: VALID / REJECTED
```

---

## Smart Contract

| File | Description |
|------|-------------|
| [`contracts/AgeGate.compact`](./contracts/AgeGate.compact) | Main ZK age-gate circuit. Evaluates `age >= minAge` locally and verifies one-time nullifier. |
| [`contracts/managed-api.ts`](./contracts/managed-api.ts) | TypeScript bindings (pre-generated from Compact compiler). |

### AgeGate.compact — Key circuits

```compact
// Private witnesses (never leave the wallet)
witness localBirthYear(): Uint<16>;
witness localSecretKey(): Bytes<32>;

// The ZK circuit — only the nullifier and counter change on-chain
export circuit proveAge(): [] {
  const secretKey = localSecretKey();
  const proofNullifier = nullifier(secretKey);
  assert(!usedNullifiers.member(disclose(proofNullifier)), "already used");
  const birthYear = localBirthYear();
  const age = (referenceYear - birthYear) as Uint<16>;
  assert(age >= minAge, "minimum age not met");
  usedNullifiers.insert(disclose(proofNullifier));
  verifiedCount.increment(1);
}
```

---

## Multi-Wallet Support (Lace & 1AM)

VeilPass connects directly to Midnight Network browser extensions via the standard DApp Connector API:

- **Lace Wallet**: The official Midnight Lace browser extension (`window.midnight.mnLace`)
- **1AM Wallet**: The community-driven Midnight privacy wallet (`window.midnight["1am"]` / `window.oneAM`)
- **Sandbox ZK Wallet**: Instant in-browser ephemeral ZK keypair (zero-friction testing without extensions)

```typescript
import { connectWallet } from "@/lib/midnight-wallet";

// Connect to Lace, 1AM, or Sandbox
const { api, state } = await connectWallet("lace"); // or "1am" / "sandbox"
console.log(`Connected address: ${state.address} on ${state.type}`);
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | [Compact](https://docs.midnight.network/develop/reference/compact) (Midnight's ZK DSL) |
| Wallet | [`@midnight-ntwrk/dapp-connector-api`](https://www.npmjs.com/package/@midnight-ntwrk/dapp-connector-api) |
| Frontend | React 19 + TanStack Start |
| Styling | Tailwind CSS v4 |
| Testing | Vitest |
| CI/CD | GitHub Actions |
| Bundler | Vite |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 or [Bun](https://bun.sh)
- (Optional) [Midnight Lace wallet](https://midnight.network) browser extension for real wallet flow
- (Optional) Docker for running a local Proof Server

### Installation

```sh
git clone https://github.com/missingmoonlight/veilpass.git
cd veilpass
npm install
npm run dev
```

The app starts at `http://localhost:3000`.

### Running Tests

```sh
npm run test
# or
bun test
```

Expected output: **20 tests passing**.

### Building for Production

```sh
npm run build
```

---

## CI/CD

The [GitHub Actions workflow](./.github/workflows/ci.yml) runs on every push:

| Job | Description |
|-----|-------------|
| **lint** | ESLint + TypeScript type check |
| **test** | 20 Vitest tests |
| **build** | Production Vite build |
| **contracts** | Compact syntax validation (pragma, exports) |

---

## Project Structure

```
veilpass/
├── contracts/
│   ├── AgeGate.compact          # Single ZK age-gate circuit
│   └── managed-api.ts           # Pre-generated TypeScript bindings
├── src/
│   ├── hooks/
│   │   └── use-midnight-wallet.ts   # React hook for wallet lifecycle
│   ├── lib/
│   │   ├── midnight-wallet.ts       # DApp Connector API integration (Lace & 1AM)
│   │   └── contract-api.ts          # Contract interaction layer
│   ├── routes/
│   │   └── index.tsx                # Main dApp UI
│   └── tests/
│       └── age-gate.test.ts         # 20 age gate, ZK, nullifier & wallet tests
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
└── README.md
```

---

## Submission Checklist

- [x] Fully functional dApp using Midnight's privacy model (Age / Eligibility Gate)
- [x] Minimum 3 tests passing (20 tests passing)
- [x] CI/CD pipeline (`.github/workflows/ci.yml`)
- [x] Approved idea: **Age / Eligibility Gate**
- [x] Minimum 10 meaningful commits
- [x] Public GitHub repository with complete README
- [x] Live demo link: [missingmoonlight.github.io/veilpass](https://missingmoonlight.github.io/veilpass)
- [x] Privacy model section (see above)
- [x] Real wallet integration via `@midnight-ntwrk/dapp-connector-api`

---

## License

MIT © VeilPass Contributors
