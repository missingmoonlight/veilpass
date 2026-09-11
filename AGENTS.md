# VeilPass Agent Instructions

## Architecture Guidelines
- **Midnight Network & Compact Contracts**: All smart contract circuits reside in `contracts/` with `.compact` language specification.
- **Privacy Model**: Sensitive inputs (`localBirthYear`, `localSecretKey`, `localVoterKey`, `localChosenOption`) must always remain private witnesses and never be exposed on-chain.
- **Wallet Integration**: The frontend connects to the Midnight Lace wallet using `@midnight-ntwrk/dapp-connector-api`.
- **Testing**: Maintain high test coverage in `src/tests/` with Vitest.
