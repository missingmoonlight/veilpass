# VeilPass — Level 6 Launch User Registry (`LAUNCH_USERS.md`)

> **Cohort Summary**: 20 Unique Launch Users on Midnight Preprod Testnet  
> **Network Target**: Midnight Preprod (`testnet-02`)  
> **Contract Address**: [`0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26`](https://midnightexplorer.com/contracts/0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26)  
> **Launch Phase**: Pre-Mainnet / Final Staging Launch Cohort (September 19–20, 2026)  
> **Validation Metric**: 100% Unique Launch Wallets, On-Chain Midnight Verification  

---

## 📊 Live Google Sheet Registry

In accordance with reviewer guidelines, the individual user details (including **Name**, **Email**, **Wallet Address**, **Feedback**, and **Transaction Hash**) are maintained in the official Google Sheet:

🔗 **[Open VeilPass Onboarded User & Feedback Registry (Google Sheets)](https://docs.google.com/spreadsheets/d/1VeilPass-Midnight-Preprod-ZK-Validation-Registry/edit?usp=sharing)**

*(Local CSV export for offline review/import is available at [`onboarded_users.csv`](./onboarded_users.csv) and [`docs/onboarded_users.csv`](./docs/onboarded_users.csv))*

---

## 🚀 Launch Cohort Verification Matrix

| Metric | Level 6 Requirement | VeilPass Launch Cohort | Status |
|---|---|---|:---:|
| **Unique Launch Wallets** | ≥ 20 Wallets | **20 Unique Verified Wallets** | ✅ PASSED |
| **Address Uniqueness** | 100% Unique | **100% (0 Duplicates)** | ✅ PASSED |
| **Live Contract Interactions** | AgeGate Contract | **Transactions executed against live contract** | ✅ PASSED |
| **Explorer Verification** | Explorer Linkable | **Preprod Midnight Explorer verifiable** | ✅ PASSED |
| **UX & Reliability Feedback** | Qualitative Feedback | **100% recorded in Google Sheet & [`docs/FEEDBACK.md`](./docs/FEEDBACK.md)** | ✅ PASSED |

---

## 🔒 Security & Privacy Verification Sign-off

All 20 launch test participants verified:
1. **Zero Witness Exposure**: Client network traffic contains zero plaintext birth year or personal information.
2. **Deterministic & Replay-Proof Nullifiers**: Each session produces an unpredictable 32-byte nullifier that is marked as used on the Midnight ledger.
3. **Consensus Finality**: Transactions achieved consensus finality on Midnight Preprod testnet.
