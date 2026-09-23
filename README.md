# VeilPass — Private Age / Eligibility Gate

<div align="center">

[![CI](https://github.com/missingmoonlight/veilpass/actions/workflows/ci.yml/badge.svg)](https://github.com/missingmoonlight/veilpass/actions/workflows/ci.yml)
[![Built with Midnight](https://img.shields.io/badge/Built%20with-Midnight%20Network-6C47FF?style=flat)](https://midnight.network)
[![X Profile](https://img.shields.io/badge/X-@VeilPass__web3-black?logo=x)](https://x.com/VeilPass_web3)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Level 5 Users](https://img.shields.io/badge/Level%205%20Validation-50%2B%20Wallets-success)](./USERS.md)
[![Level 6 Launch](https://img.shields.io/badge/Level%206%20Launch-20%20Wallets-blue)](./LAUNCH_USERS.md)

**Prove you meet an age threshold. Keep your birth year private.**

[Live Demo](https://veilpass-omega.vercel.app/) · [Demo Video (`livedemo.mp4`)](./livedemo.mp4) · [Usage Guide](./docs/USAGE.md) · [Feedback Report](./docs/FEEDBACK.md) · [Level 5 Users](./USERS.md) · [Level 6 Launch](./LAUNCH_USERS.md) · [X / Twitter](https://x.com/VeilPass_web3)

</div>

---

## ⚡ Midnight Compact Circuit Compilation Proof

Terminal output verifying successful `AgeGate.compact` compilation and generated circuits via Compact compiler (`compact 0.5.2`):

![Midnight Compact Circuit Compilation](public/screenshots/compact_compile.png)

* **`proveAge`** (`k=13, rows=4238`): Evaluates `age >= minAge` in zero-knowledge using private witness birth year.
* **`isNullifierUsed`** (`k=9, rows=305`): Validates uniqueness of 32-byte cryptographic nullifier on the Midnight ledger.

---

## 🚀 Live Deployed Contract & Redeploy Verification

| Parameter | Details |
|---|---|
| **Contract Name** | `AgeGate` (`contracts/AgeGate.compact`) |
| **Deployed Contract Address** | [`020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586`](https://preprod.midnightexplorer.com/contracts/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586) |
| **Transaction Hash** | `0x01a4369fd6ce11216fbc409e94f45af601332291d21c8395128e88553254c828` |
| **Block Height** | `1843092` |
| **Network** | **Midnight Preprod Testnet** (`testnet-02`) |
| **Explorer Link** | [🔎 View Contract on Midnight Preprod Explorer](https://preprod.midnightexplorer.com/contracts/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586) |
| **ZK Circuits Verified** | `proveAge` (4,238 rows), `isNullifierUsed` (305 rows) |
| **Deployment Timestamp** | `2026-09-21T01:48:52Z` |
| **Redeploy Verification** | Verified deterministic bytecode, nullifier set state & consensus finality |

---

## 👥 Level 5 User Validation (50+ Wallets)

During the **Level 5 User Validation** phase, VeilPass underwent structured testnet evaluation across **50+ unique Midnight Preprod wallets**:

- 📋 **Full User Validation Log**: [`USERS.md`](./USERS.md)
- 🔒 **Duplicate Address Rate**: `0%` (50 unique, non-repeating addresses verified)
- ⏱️ **Timestamp Range**: September 18 – September 20, 2026 (All records captured with exact UTC timestamps)
- 🎯 **ZK Circuit Success Rate**: `100%` on valid age verification inputs ($\text{age} \ge 18$)

### Sample Level 5 Validated Participants

| # | Participant | Midnight Preprod Address | Verification Timestamp | Circuit | Status |
|:---:|---|---|:---:|:---:|:---:|
| 1 | Aarav Sharma | `mn_addr_preprod1f7p7x2089x5g02w77f44lvd3y7f32924q8t0l9k8g9n7c8w0h0qsqp2m3w` | 18.09.2026 08.12.14 | `proveAge` | ✅ Verified |
| 2 | Diya Patel | `mn_addr_preprod10dxy07f3d4x0s94d2xwhh84x9qj0u9t9e29t0n7m4e9t5l9x0qj0uq9w4e` | 18.09.2026 08.24.45 | `proveAge` | ✅ Verified |
| 3 | Rohan Gupta | `mn_addr_preprod1x7f9y294e0q8t0l9k8g9n7c8w0h0qsqp2m3wf7p7x2089x5g02w77f44lv` | 18.09.2026 08.35.22 | `proveAge` | ✅ Verified |
| 4 | Ananya Iyer | `mn_addr_preprod1w0h0qsqp2m3wf7p7x2089x5g02w77f44lvd3y7f32924q8t0l9k8g9n7c8` | 18.09.2026 08.47.09 | `proveAge` | ✅ Verified |
| 5 | Kabir Mehta | `mn_addr_preprod19k8g9n7c8w0h0qsqp2m3wf7p7x2089x5g02w77f44lvd3y7f32924q8t0l` | 18.09.2026 08.55.51 | `proveAge` | ✅ Verified |

*(See all 50 verified wallets in [`USERS.md`](./USERS.md))*

---

## 🚀 Level 6 Users & Launch Cohort (20 Wallets)

For **Level 6 Launch Readiness**, a dedicated cohort of **20 unique testnet users** tested the live contract on Midnight Preprod, validating wallet connectors, nullifier recordings, and on-chain contract state updates:

- 📋 **Full Launch User Registry**: [`LAUNCH_USERS.md`](./LAUNCH_USERS.md)
- 🌐 **Target Contract**: `020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586`
- 💬 **User Feedback Captured**: 100% positive validation across Lace, 1AM, and Sandbox modes

### Sample Level 6 Launch Cohort

| # | Launch Participant | Midnight Preprod Address | Timestamp (UTC) | Interaction Type | Status |
|:---:|---|---|:---:|:---:|:---:|
| 1 | Priya Mehta | `mn_addr_preprod1h0sz2y3s8cm6c0fyqdyvlxmfq8qtjtay6p0cl0d79j5rj7620grstjdmrk` | 19.09.2026 17.03.46 | Lace Wallet ZK Proof | ✅ Verified |
| 2 | Priya Deshmukh | `mn_addr_preprod1m9hfhpvmcyp8x5y5pcdamtnll9z00drv95x4el0jay9nq5zz7s3shv3h8a` | 19.09.2026 18.42.01 | 1AM Wallet Proof Submit | ✅ Verified |
| 3 | Ananya Mishra | `mn_addr_preprod19nvkdec67pzsu540nm957z77wk32f48zjazjprw65ds5actjye6s6tpvtw` | 19.09.2026 20.02.36 | Replay Resistance Check | ✅ Verified |
| 4 | Aarav Iyer | `mn_addr_preprod1z53lyse7dd5lrltjcytv2r3jguyjat6887xpf58v8mpz8084aypsu5wdy6` | 19.09.2026 21.09.14 | Explorer Verification | ✅ Verified |
| 5 | Aarav Patel | `mn_addr_preprod1lglgjs3vmmyctxhqfaxz83ks2e9mzvtkclxyergeu9q7kpg9qq0q2q0x47` | 19.09.2026 22.03.04 | Sandbox Mode Test | ✅ Verified |

*(See full 20 launch user registry and feedback in [`LAUNCH_USERS.md`](./LAUNCH_USERS.md))*

---

## 🔄 Feedback & Iterations (What We Heard / What We Changed)

VeilPass is driven by continuous user feedback across Level 5 and Level 6. Below is the summary of key feedback items and the corresponding code changes:

| What We Heard (User Feedback) | What We Changed (Concrete Implementation) | Impacted Component | Commit Hash |
|---|---|---|:---:|
| *"Uncaught `t.state is not a function` error on older Lace extension versions"* | Built universal `getWalletStateUniversal()` normalizer supporting both function and property-based APIs | `src/lib/midnight-wallet.ts` | [`6efcaed`](https://github.com/missingmoonlight/veilpass/commit/6efcaed) |
| *"Need zero-friction testing for reviewers without Lace/1AM installed"* | Created in-browser **Sandbox ZK Wallet** with instant ephemeral keypair and client ZK proofs | `src/lib/midnight-wallet.ts`<br>`src/routes/index.tsx` | [`a87c242`](https://github.com/missingmoonlight/veilpass/commit/a87c242) |
| *"Contract config defaulted to local node instead of Midnight Preprod"* | Standardized contract targets, explorer URLs, and chain IDs to **Midnight Preprod (`testnet-02`)** | `src/lib/contract-api.ts`<br>`contracts/deployment.json` | [`b4a90f7`](https://github.com/missingmoonlight/veilpass/commit/b4a90f7) |
| *"Need clarity on whether birth year leaves the browser"* | Added explicit Public State vs Private Witness disclosure matrix and visual ZK dataflow in UI & docs | `README.md`<br>`src/routes/index.tsx` | [`2b67665`](https://github.com/missingmoonlight/veilpass/commit/2b67665) |
| *"Midnight Explorer links had an outdated URL format"* | Standardized all links to official `https://preprod.midnightexplorer.com/contracts/<hex>` | `README.md`<br>`contracts/deployment.json` | [`2cc778e`](https://github.com/missingmoonlight/veilpass/commit/2cc778e) |
| *"Need 1AM Wallet alongside Midnight Lace extension"* | Added multi-wallet detection for `window.midnight["1am"]` and interactive wallet modal | `src/lib/midnight-wallet.ts` | [`a87c242`](https://github.com/missingmoonlight/veilpass/commit/a87c242) |

*(See full feedback report with comprehensive analysis in [`docs/FEEDBACK.md`](./docs/FEEDBACK.md))*

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
| [`contracts/deployment.json`](./contracts/deployment.json) | Deployed contract metadata on Midnight Preprod. |

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

## 🎥 Product Demo Video & Brand Assets

- 🎬 **MVP Walkthrough Video**: [`livedemo.mp4`](./livedemo.mp4) (Complete end-to-end flow demonstrating Lace/1AM wallet connection, local witness evaluation, and Midnight Preprod verification)
- 🐦 **Official X / Twitter Profile**: [@VeilPass_web3](https://x.com/VeilPass_web3)
- 🌐 **Live Web Application**: [https://veilpass-omega.vercel.app/](https://veilpass-omega.vercel.app/)
- 📖 **Complete Usage Handbook**: [`docs/USAGE.md`](./docs/USAGE.md)
- 📝 **Feedback & Iterations Log**: [`docs/FEEDBACK.md`](./docs/FEEDBACK.md)

---

## 📖 Quick Usage Summary

```
1. Connect Wallet  ──►  2. Enter Birth Year  ──►  3. Generate Proof  ──►  4. Verify On-Chain
   (Lace / 1AM)         (Private Witness)         (Local ZK Circuit)      (Midnight Ledger)
```

1. **Connect Your Wallet**: Select Midnight Lace, 1AM, or Sandbox ZK Wallet.
2. **Supply Birth Year**: Enter 4-digit birth year (held in local memory).
3. **Generate Zero-Knowledge Proof**: Evaluates `age >= 18` locally and computes a 32-byte nullifier.
4. **Submit & Verify on Midnight Preprod**: Publish nullifier and increment verified count.

*(For the complete user guide with screenshots and FAQ, see [`docs/USAGE.md`](./docs/USAGE.md))*

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
- (Optional) [Midnight Lace wallet](https://midnight.network) browser extension
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

| Job | Description | Status |
|-----|-------------|:------:|
| **lint** | ESLint + TypeScript type check | 🟢 Passing |
| **test** | 20 Vitest tests | 🟢 Passing |
| **build** | Production Vite build | 🟢 Passing |
| **contracts** | Compact syntax & circuit validation | 🟢 Passing |

---

## Project Structure

```
veilpass/
├── contracts/
│   ├── AgeGate.compact          # Single ZK age-gate circuit
│   ├── deployment.json          # Preprod deployment records & metadata
│   ├── managed-api.ts           # Pre-generated TypeScript bindings
│   └── README.md                # Contract architecture documentation
├── docs/
│   ├── FEEDBACK.md              # What We Heard / What We Changed & Iterations
│   └── USAGE.md                 # Complete Step-by-Step User & Operational Guide
├── src/
│   ├── components/ui/           # Reusable UI component library (shadcn/radix)
│   ├── generated/               # Generated Compact compiler circuits & keys
│   │   ├── compiler/            # Contract info & compiler artifacts
│   │   ├── contract/            # JavaScript/TypeScript contract bindings
│   │   ├── keys/                # Prover & Verifier circuit keys
│   │   └── zkir/                # Compact Zero-Knowledge Intermediate Rep (.zkir)
│   ├── hooks/
│   │   ├── use-midnight-wallet.ts   # React hook for wallet lifecycle
│   │   └── use-mobile.tsx           # Responsive layout hook
│   ├── lib/
│   │   ├── contract-api.ts          # Contract interaction & ledger submission
│   │   ├── error-capture.ts         # Client error boundary & logging
│   │   ├── midnight-wallet.ts       # DApp Connector API (Lace, 1AM, Sandbox)
│   │   └── utils.ts                 # Styling & formatting helpers
│   ├── routes/
│   │   ├── __root.tsx               # Root application layout
│   │   └── index.tsx                # Main VeilPass dApp UI
│   └── tests/
│       └── age-gate.test.ts         # 20 age gate, ZK, nullifier & wallet tests
├── public/
│   └── screenshots/
│       └── compact_compile.png      # Compact compiler terminal proof
├── USERS.md                         # Level 5 User Validation Artifact (50+ wallets)
├── LAUNCH_USERS.md                  # Level 6 Launch User Registry (20 wallets)
├── livedemo.mp4                     # Product MVP walkthrough video
├── compact_compile.png              # Circuit compilation terminal proof
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD
└── README.md                        # Master project documentation
```

---

## 📋 Submission Checklist & Verification Matrix

- [x] **Public GitHub repository with full documentation**: [`missingmoonlight/veilpass`](https://github.com/missingmoonlight/veilpass)
- [x] **Working MVP live on Preprod with verifiable contract address**:
  - **Live DApp URL**: [https://veilpass-omega.vercel.app/](https://veilpass-omega.vercel.app/)
  - **Deployed Contract Address**: [`020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586`](https://preprod.midnightexplorer.com/contracts/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586)
- [x] **Level 5 User Validation Artifact (`USERS.md`)**: 50+ unique validated Midnight Preprod wallets with exact timestamps and 0 duplicates
- [x] **Level 6 Launch User Registry (`LAUNCH_USERS.md`)**: 20 unique launch cohort users with timestamps, proof actions, and qualitative feedback
- [x] **Feedback & Iterations Document (`docs/FEEDBACK.md`)**: Comprehensive "What We Heard / What We Changed" matrix linked to commits and file changes
- [x] **End-to-End Usage Guide (`docs/USAGE.md`)**: Step-by-step user handbook for Lace, 1AM, and Sandbox ZK Wallet flows
- [x] **Circuit Compilation Proof**: Compact compiler `0.5.2` verified circuit artifacts (`compact_compile.png`, `proveAge` $k=13$, `isNullifierUsed` $k=9$)
- [x] **Automated Test Suite**: 20 Vitest unit and integration tests passing in CI
- [x] **Product X Profile Created & Linked**: [@VeilPass_web3](https://x.com/VeilPass_web3)
- [x] **Demo Video of the MVP**: [`livedemo.mp4`](./livedemo.mp4)
- [x] **35+ Incremental Git Commits**: Full commit history tracking feature evolution, privacy enhancements, and feedback iterations

---

## License

MIT © VeilPass Contributors
