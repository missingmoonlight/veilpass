# VeilPass — End-to-End Usage & Operational Guide (`docs/USAGE.md`)

This guide provides step-by-step instructions for interacting with **VeilPass**, the zero-knowledge age verification gate built on the **Midnight Network**.

---

## 📑 Table of Contents

1. [Prerequisites & Supported Wallets](#1-prerequisites--supported-wallets)
2. [Network Configuration (Midnight Preprod)](#2-network-configuration-midnight-preprod)
3. [Acquiring Preprod Testnet tDUST](#3-acquiring-preprod-testnet-tdust)
4. [Step-by-Step Verification Walkthrough](#4-step-by-step-verification-walkthrough)
   - [Step 1: Connect Your Midnight Wallet](#step-1-connect-your-midnight-wallet)
   - [Step 2: Enter Birth Year (Private Witness)](#step-2-enter-birth-year-private-witness)
   - [Step 3: Generate Local Zero-Knowledge Proof](#step-3-generate-local-zero-knowledge-proof)
   - [Step 4: Broadcast & Verify on Midnight Ledger](#step-4-broadcast--verify-on-midnight-ledger)
5. [Testing via Sandbox ZK Wallet (Zero Extension Setup)](#5-testing-via-sandbox-zk-wallet-zero-extension-setup)
6. [Inspecting Contract State on Midnight Explorer](#6-inspecting-contract-state-on-midnight-explorer)
7. [Smart Contract & Circuit Architecture](#7-smart-contract--circuit-architecture)
8. [Troubleshooting & Frequently Asked Questions](#8-troubleshooting--frequently-asked-questions)

---

## 1. Prerequisites & Supported Wallets

To interact with VeilPass on the Midnight Network, you have three flexible options:

| Option | Wallet Provider | Installation Link | Best For |
|---|---|---|---|
| **Option A** (Recommended) | **Midnight Lace Wallet** | [Midnight Official Extension](https://midnight.network) | Full browser extension experience with real signing |
| **Option B** | **1AM Wallet** | [1AM Midnight Wallet](https://github.com/oneam-wallet) | Alternative community privacy wallet |
| **Option C** | **Sandbox ZK Wallet** | *Built directly into VeilPass UI* | Instant zero-install testing with in-memory ZK keys |

---

## 2. Network Configuration (Midnight Preprod)

Ensure your browser extension is configured to the **Midnight Preprod Testnet**:

- **Network Name**: Midnight Preprod (`testnet-02`)
- **Contract Address**: `020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586`
- **Explorer URL**: [https://preprod.midnightexplorer.com](https://preprod.midnightexplorer.com/contracts/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586)

---

## 3. Acquiring Preprod Testnet tDUST

Transactions that publish nullifiers to the Midnight ledger consume a minimal amount of testnet gas tokens (**tDUST**):

1. Copy your Midnight Preprod address from your Lace or 1AM wallet (starts with `mn_addr_preprod1...`).
2. Visit the **Midnight Preprod Faucet** (available in the Midnight developer portal / Lace wallet faucet tab).
3. Request testnet tDUST. Funds typically arrive within 10–30 seconds.

*(Note: If using **Sandbox ZK Wallet**, gas estimation is simulated in memory and requires no faucet tokens).*

---

## 4. Step-by-Step Verification Walkthrough

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ 1. Connect      │  ──►  │ 2. Enter Birth  │  ──►  │ 3. Generate ZK  │  ──►  │ 4. Verify on    │
│    Wallet       │       │    Year         │       │    Proof        │       │    Ledger       │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
  (Lace/1AM/Sandbox)       (Private Witness)         (Local Memory Circuit)    (Midnight Preprod)
```

### Step 1: Connect Your Midnight Wallet
1. Open the VeilPass dApp at [https://veilpass-omega.vercel.app/](https://veilpass-omega.vercel.app/) (or `http://localhost:3000` locally).
2. Click **Connect Wallet** in the top navigation bar.
3. Select your provider:
   - **Midnight Lace**
   - **1AM Wallet**
   - **Sandbox ZK Wallet**
4. Approve the connection request in your wallet extension. Your truncated wallet address and active network badge (`Preprod Testnet`) will appear in the top right.

### Step 2: Enter Birth Year (Private Witness)
1. In the **Age Verification** card, input your four-digit birth year (e.g. `2000`).
2. Notice the 🔒 **Zero-Knowledge Privacy Guarantee** badge:
   - Your birth year is stored **strictly in local client RAM**.
   - It is never included in any network request or smart contract transaction payload.

### Step 3: Generate Local Zero-Knowledge Proof
1. Click the **Generate ZK Proof** button.
2. The Compact circuit computes:
   $$\text{age} = \text{referenceYear} (2026) - \text{localBirthYear}$$
   $$\text{assert}(\text{age} \ge 18)$$
   $$\text{proofNullifier} = \mathcal{H}(\text{localSecretKey})$$
3. When the local computation completes (~200–400ms), the UI reveals:
   - ✅ **Proof Status**: Generated & Validated Locally
   - 🔑 **Cryptographic Nullifier**: 32-byte unique hex string (e.g. `0x7f4e92...`)
   - 🛡️ **Witness Protection**: 0 bytes of birth year leaked

### Step 4: Broadcast & Verify on Midnight Ledger
1. Click **Submit Proof to Midnight**.
2. Your wallet extension prompts for signature confirmation to record the nullifier.
3. Confirm the transaction.
4. The Midnight consensus nodes verify:
   - The nullifier is not present in `usedNullifiers`.
   - The ZK proof satisfies the verification key.
   - The contract inserts the nullifier into `usedNullifiers` and increments `verifiedCount`.
5. A confirmation badge appears with a direct link to the transaction on the **Midnight Preprod Explorer**.

---

## 5. Testing via Sandbox ZK Wallet (Zero Extension Setup)

If you are evaluating VeilPass in an environment without browser extensions:

1. Click **Connect Wallet** → **Sandbox ZK Wallet**.
2. An ephemeral 256-bit ZK identity is instantiated in memory.
3. You can execute full proof generation, test boundary ages (e.g., 2008 for exact 18-year gate, 2010 for under-age rejection), and inspect nullifier generation.

---

## 6. Inspecting Contract State on Midnight Explorer

You can independently inspect the live `AgeGate` smart contract on the public explorer:

- **Direct Contract Link**: [View on Midnight Preprod Explorer](https://preprod.midnightexplorer.com/contracts/020023cb08948a7c9cea4da3ecc1f1a96da9fba105c9f0f9583232da6db18934d586)
- **Deployment Transaction**: `0x01a4369fd6ce11216fbc409e94f45af601332291d21c8395128e88553254c828`
- **Block Height**: `1843092`

On the contract page, you will observe:
- **`verifiedCount`**: Total count of anonymous proofs accepted.
- **`usedNullifiers`**: Hash-set of consumed one-time nullifiers preventing replay.

---

## 7. Smart Contract & Circuit Architecture

VeilPass is powered by Compact circuits located in [`contracts/AgeGate.compact`](file:///contracts/AgeGate.compact):

```compact
// Private witnesses held in wallet memory
witness localBirthYear(): Uint<16>;
witness localSecretKey(): Bytes<32>;

// ZK Age Gate circuit
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

### Circuit Characteristics
- **`proveAge` Circuit**: $k=13$, 4,238 constraint rows.
- **`isNullifierUsed` Circuit**: $k=9$, 305 constraint rows.
- **Nullifier Derivation**: Cryptographic Poseidon / BLAKE2s hash over 32-byte secret session entropy.

---

## 8. Troubleshooting & Frequently Asked Questions

### Q1: Wallet connection modal does not detect Lace Wallet.
- **Solution**: Ensure the Midnight Lace extension is installed and unlocked. If using Brave browser, check that "Shields" is not blocking extension provider scripts. Alternatively, use the **Sandbox ZK Wallet** option.

### Q2: "minimum age not met" circuit assertion error.
- **Solution**: The contract enforces $\text{age} = \text{referenceYear} (2026) - \text{birthYear} \ge 18$. A birth year greater than 2008 will fail circuit validation as expected.

### Q3: "already used" nullifier error.
- **Solution**: This error indicates that the 32-byte nullifier has already been registered on-chain. In normal operation, a fresh secret entropy is generated per session to ensure each pass has a distinct nullifier.

### Q4: How do I run the full automated test suite locally?
- Run `npm run test` or `bun test`. All 20 Vitest unit/integration tests will execute and validate the circuit math, wallet layer, and error handling.
