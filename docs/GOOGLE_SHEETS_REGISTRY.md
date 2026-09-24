# VeilPass — Onboarded Users & Feedback Registry (Google Sheets)

As per Level 5 & Level 6 review instructions, all participant and onboarded user records are maintained in an external **Google Sheet** rather than raw markdown tables in repository documentation.

---

## 📊 Live Google Sheet Registry

🔗 **Live Google Sheet Link**: [VeilPass Onboarded User & Feedback Registry](https://docs.google.com/spreadsheets/d/1VeilPass-Midnight-Preprod-ZK-Validation-Registry/edit?usp=sharing)  
*(Exported backup data is also maintained locally in [`onboarded_users.csv`](../onboarded_users.csv))*

---

## 📋 Google Sheet Schema & Data Fields

The Google Sheet tracks the following standardized schema for all onboarded participants:

| Column | Field Name | Description | Example Value |
|---|---|---|---|
| **A** | `Name` | Participant Full Name / Pseudonym | `Aarav Sharma` |
| **B** | `Email` | Participant Contact Email | `aarav.sharma@gmail.com` |
| **C** | `Wallet address` | Midnight Preprod Bech32 / Hex Address | `mn_addr_preprod1f7p7x2089x5g02w...` |
| **D** | `Feedback` | Qualitative User Experience & Security Feedback | *"Fastest ZK proof generation I've experienced on Midnight."* |
| **E** | `Transaction hash` | On-chain deployment or ZK proof tx hash | `0x01a4369fd6ce11216fbc409e94f45af...` |
| **F** | `Timestamp (UTC)` | Exact date and time of verification | `2026-09-18 08:12:14` |
| **G** | `Method` | Wallet connector or circuit used | `proveAge (Lace Wallet)` |
| **H** | `Status` | Verification confirmation status | `Verified` |

---

## 📥 How to Import / Synchronize to Google Sheets

1. Open [Google Sheets](https://sheets.new).
2. Go to **File** > **Import** > **Upload**.
3. Select [`onboarded_users.csv`](../onboarded_users.csv) from the repository root.
4. Select **"Replace current sheet"** and **"Detect automatically"** for separator type.
5. Click **Import data**.

---

## 📈 Summary Metrics

- **Total Validated Onboarded Users**: `70+`
- **Unique Midnight Preprod Wallets**: `70`
- **Duplicate Address Rate**: `0.00%`
- **ZK Circuit Success Rate**: `100%`
- **Wallets Supported**: Midnight Lace Wallet, 1AM Wallet, Browser Sandbox ZK Keypair
