# VeilPass — Private Age / Eligibility Gate

<div align="center">

![VeilPass Banner](public/og-image.png)

[![CI](https://github.com/missingmoonlight/veilpass/actions/workflows/ci.yml/badge.svg)](https://github.com/missingmoonlight/veilpass/actions/workflows/ci.yml)
[![Built with Midnight](https://img.shields.io/badge/Built%20with-Midnight%20Network-6C47FF?style=flat)](https://midnight.network)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Prove you meet an age threshold. Keep your birth year private.**

[Live Demo](https://veilpass.lovable.app) · [Compact Contracts](./contracts/) · [CI/CD](https://github.com/missingmoonlight/veilpass/actions)

</div>

---

## What is VeilPass?

VeilPass is a **fully functional Age / Eligibility Gate dApp** built on [Midnight Network](https://midnight.network). It uses **zero-knowledge proofs** via Midnight's Compact smart contract language to let a user prove they are 18 or older — without ever revealing their birth year.

**Selected idea from the approved list:** *Age / Eligibility Gate — prove a threshold without revealing the underlying value.*

---

## Privacy Model

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

### How it works

```
User's device                    Compact Circuit (on-chain)
─────────────────               ────────────────────────────
birthYear ─────┐                assert age >= minAge
secretKey ─────┤  ZK Proof  →   insert nullifier into usedNullifiers
               └─ (private)     increment verifiedCount
                                ← proof valid / invalid
```

The `birthYear` and `secretKey` are **private witnesses** — they are supplied by the user's wallet, used inside the Compact circuit's proof system, and **never transmitted to the node, indexer, or any other party**.

---

## Contracts

| File | Description |
|------|-------------|
| [`contracts/AgeGate.compact`](./contracts/AgeGate.compact) | Main ZK age-gate circuit. Checks `age >= minAge` and records a one-time nullifier. |
| [`contracts/PrivateVoting.compact`](./contracts/PrivateVoting.compact) | Anonymous ballot contract. Voters cast votes privately; only tallies are public. |
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

## Real Wallet Integration

VeilPass uses the official **Midnight DApp Connector API** to connect to the [Lace wallet](https://midnight.network):

```typescript
// Detects Lace at window.midnight.mnLace
import { connectLaceWallet, isLaceInstalled } from "@/lib/midnight-wallet";

const { api, state } = await connectLaceWallet();
// state.address, state.balances, api.submitTransaction(...)
```

The integration gracefully falls back to demo mode if the Lace extension is not installed.

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

Expected output: **23 tests passing** across 2 test suites.

### Building for Production

```sh
npm run build
```

---

## Compiling & Deploying the Contracts

The Compact compiler is a standalone binary. To compile the contracts yourself:

```sh
# Install Compact compiler (Linux/macOS/WSL)
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/midnightntwrk/compact/releases/latest/download/compact-installer.sh | sh

# Compile AgeGate contract
compact compile contracts/AgeGate.compact --output src/generated/

# Compile PrivateVoting contract
compact compile contracts/PrivateVoting.compact --output src/generated/
```

The pre-compiled TypeScript bindings are already included in [`contracts/managed-api.ts`](./contracts/managed-api.ts).

### Deploying to Midnight Preprod

```sh
# With a running Proof Server (Docker) and Lace wallet configured:
npx create-mn-app --template deploy \
  --contract contracts/AgeGate.compact \
  --network preprod
```

---

## CI/CD

The [GitHub Actions workflow](./.github/workflows/ci.yml) runs on every push:

| Job | Description |
|-----|-------------|
| **lint** | ESLint + TypeScript type check |
| **test** | 23 Vitest tests across 2 suites |
| **build** | Production Vite build |
| **contracts** | Compact syntax validation (pragma, exports) |

---

## Project Structure

```
veilpass/
├── contracts/
│   ├── AgeGate.compact          # ZK age-gate circuit
│   ├── PrivateVoting.compact    # ZK anonymous voting circuit
│   └── managed-api.ts           # Pre-generated TypeScript bindings
├── src/
│   ├── hooks/
│   │   └── use-midnight-wallet.ts   # React hook for wallet lifecycle
│   ├── lib/
│   │   ├── midnight-wallet.ts       # DApp Connector API integration
│   │   └── contract-api.ts          # Contract interaction layer
│   ├── routes/
│   │   └── index.tsx                # Main dApp UI
│   └── tests/
│       ├── age-gate.test.ts         # 12 age gate tests
│       └── voting.test.ts           # 11 voting tests
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
└── README.md
```

---

## Submission Checklist

- [x] Fully functional dApp using Midnight's privacy model (Age / Eligibility Gate)
- [x] Minimum 3 tests passing (23 tests across 2 suites)
- [x] CI/CD pipeline (`.github/workflows/ci.yml`)
- [x] Approved idea: **Age / Eligibility Gate**
- [x] Minimum 10 meaningful commits
- [x] Public GitHub repository with complete README
- [x] Live demo link: [veilpass.lovable.app](https://veilpass.lovable.app)
- [x] Privacy model section (see above)
- [x] Real wallet integration via `@midnight-ntwrk/dapp-connector-api`

---

## License

MIT © VeilPass Contributors
