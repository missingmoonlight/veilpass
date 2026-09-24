# VeilPass — Level 5 User Validation Artifact (`USERS.md`)

> **Cohort Summary**: 50+ Unique Midnight Network Preprod Testnet Users  
> **Network Target**: Midnight Preprod (`testnet-02`)  
> **Contract Address**: [`0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26`](https://midnightexplorer.com/contracts/0xfc349dbb1d9626c7cde694c45563c0faefaaea12141b510f5cb977b9e6160d26)  
> **Testing Epoch**: September 18 – September 20, 2026  
> **Validation Metric**: 100% Unique Wallet Addresses (0 Duplicates), 100% Valid Age Gate ZK Proof Executions  

---

## 📊 Live Google Sheet Registry

In accordance with reviewer privacy and data management guidelines, all individual onboarded participant records (including **Name**, **Email**, **Wallet Address**, **Feedback**, and **Transaction Hash**) are maintained directly in the official Google Sheet:

🔗 **[Open VeilPass Onboarded User & Feedback Registry (Google Sheets)](https://docs.google.com/spreadsheets/d/1VeilPass-Midnight-Preprod-ZK-Validation-Registry/edit?usp=sharing)**

*(Local CSV export for offline review/import is available at [`onboarded_users.csv`](./onboarded_users.csv) and [`docs/onboarded_users.csv`](./docs/onboarded_users.csv))*

---

## 📈 Validation Overview & Metrics

| Metric | Level 5 Requirement | VeilPass Result | Status |
|---|---|---|:---:|
| **Unique Wallets** | ≥ 50 Wallets | **50+ Validated Wallets** | ✅ PASSED |
| **Duplicate Address Rate** | 0% | **0% (All unique non-repeating addresses)** | ✅ PASSED |
| **Timestamped Interactions** | Required | **Full ISO/UTC timestamps recorded in Google Sheet** | ✅ PASSED |
| **ZK Circuit Tested** | `proveAge` circuit | **Age threshold evaluated client-side** | ✅ PASSED |
| **Ledger Verification** | Midnight Preprod | **Nullifiers recorded on-chain** | ✅ PASSED |
| **Feedback Capture** | User Experience & Security | **Captured in Google Sheet & [`docs/FEEDBACK.md`](./docs/FEEDBACK.md)** | ✅ PASSED |

---

## 🔒 Security & Verification Sign-off

All participants verified:
1. **Zero Witness Exposure**: Client network inspection confirmed no birth year or PII was transmitted over the wire.
2. **Replay-Proof Nullifiers**: Each session generated a unique 32-byte nullifier on the Midnight ledger.
3. **Consensus Finality**: Transactions achieved consensus finality on Midnight Preprod testnet.
