# VeilPass — X (Twitter) Profile Strategy, Banner & Product Posts

This document outlines the complete X (Twitter) profile setup and high-impact product announcement posts for **[@VeilPass_web3](https://x.com/VeilPass_web3)**.

---

## 🎨 1. Profile Setup & Banner

### Header Banner
- **Banner Asset Location**: [`public/images/veilpass_x_banner.jpg`](../public/images/veilpass_x_banner.jpg)
- **Design Spec**: 1500x500 px (3:1 / 16:9 ratio), high-tech cyberpunk zero-knowledge aesthetic with Midnight Network emerald/cyan glow, cryptographic proof geometry, and shield badge.

### Bio & Profile Details
- **Display Name**: `VeilPass | ZK Age Gate 🛡️ (Built on Midnight)`
- **Handle**: `@VeilPass_web3`
- **Bio**:
  > Prove your age. Keep your identity private. 🛡️
  > Zero-knowledge age & eligibility credential gating built on @MidnightNtwrk.
  > Local witness proving • Lace & 1AM Wallet ready.
- **Location**: `Midnight Preprod Testnet`
- **Website**: `https://veilpass-omega.vercel.app`

---

## 🚀 2. Pinned Launch Thread (Master Announcement)

### Post 1 (Main Hook / Media: Banner or Demo Video)
> 🚨 Introducing **VeilPass**: The Zero-Knowledge Age & Eligibility Gate built on @MidnightNtwrk.
>
> 🛑 The problem: Websites force you to upload passports, driver's licenses, and IDs just to prove you are 18+.
>
> 🛡️ The solution: Prove you meet the threshold without revealing your birth year or identity.
>
> 🧵👇 (1/6)

### Post 2 (The Midnight Privacy Paradigm)
> 🔒 How does VeilPass work?
>
> Conventional Web3 contracts reveal transaction arguments to the world.
>
> Midnight smart contracts partition data into:
> 1️⃣ **Private Witnesses**: In-wallet birth year & secret keys (NEVER sent on-chain).
> 2️⃣ **Public Ledger State**: Policy threshold & nullifier sets.
>
> (2/6)

### Post 3 (ZK Circuit Execution)
> ⚡ Local Zero-Knowledge Proving with Compact:
>
> • Your device runs the `proveAge` circuit locally ($k=13, 4238\text{ rows}$).
> • The circuit asserts $\text{referenceYear} - \text{localBirthYear} \ge 18$.
> • A 32-byte cryptographic nullifier is generated to prevent replay attacks.
> • Witness data is instantly wiped from RAM.
>
> (3/6)

### Post 4 (Multi-Wallet Integration)
> 🦊 Seamless DApp Connectivity:
>
> Connect directly with:
> ✅ **Midnight Lace Wallet** (Standard DApp Connector)
> ✅ **1AM Wallet**
> ✅ **Instant In-Browser Sandbox ZK Wallet** (Test in 1-click without extensions)
>
> (4/6)

### Post 5 (Live Testnet & Verification)
> 🌐 Live on **Midnight Preprod Testnet**!
>
> 📜 Smart Contract: `0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26`
> 🔍 Explorer: https://midnightexplorer.com/contracts/0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26
> 💻 Open Source: https://github.com/missingmoonlight/veilpass
> 🚀 Try the Live DApp: https://veilpass-omega.vercel.app
>
> (5/6)

### Post 6 (Call to Action & Feedback)
> 👥 70+ Testnet participants have validated VeilPass!
>
> Try the live demo, generate your first zero-knowledge age proof, and share your feedback with us.
>
> Join the private Web3 revolution. 🛡️✨
>
> Like & Retweet to support privacy-first infrastructure! 🔁
>
> (6/6)

---

## 💡 3. Standalone Product Posts & Feature Spotlights

### Post A: "Privacy vs Surveillance"
> Why does an online store need your exact birthdate and passport number just to check if you're 21?
>
> They don't. They only need a boolean answer: **Yes / No**.
>
> @VeilPass_web3 uses Zero-Knowledge proofs on @MidnightNtwrk so dApps get cryptographically guaranteed compliance without holding hazardous customer PII.
>
> Privacy is not concealment. Privacy is consent. 🛡️

### Post B: "Under the Hood: The Replay Attack Problem"
> If your age proof is anonymous, what stops someone from sharing their proof with 1,000 friends?
>
> 🔑 **Cryptographic Nullifiers**.
>
> VeilPass derives $\text{Nullifier} = \mathcal{H}(\text{birthYear} \parallel \text{secretKey} \parallel \text{contractAddr})$.
> The Midnight ledger flags this nullifier as consumed without ever learning the underlying inputs.
>
> Zero identity linkability. 100% Sybil / Replay resistance. 🛡️

### Post C: "Devnet & Preprod Explorer Spotlight"
> 🔎 Track verifiable ZK verifications in real-time!
>
> Every time a user passes the VeilPass age gate, the `verifiedCount` updates on Midnight ledger while preserving 100% witness confidentiality.
>
> Check live contract activity on Midnight Explorer:
> 👉 https://midnightexplorer.com/contracts
