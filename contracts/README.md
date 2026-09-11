# VeilPass Compact contract

`AgeGate.compact` is the on-chain half of the VeilPass proof flow. The wallet provides `localBirthYear` and a contract-specific `localSecretKey` as private witnesses. The circuit proves the configured age rule and publishes only a one-time nullifier.

## Coordination flow

1. Deploy with `referenceYear` and `minAge` (the demo uses the current year and `18`).
2. Generate TypeScript bindings with the Compact compiler.
3. Implement the two witness callbacks in the wallet provider.
4. Replace the frontend's demo `generateProof` call with the generated `proveAge` circuit call.
5. Submit the balanced transaction through a Midnight-compatible wallet.

## Production notes

- Pin the Compact compiler version matching `pragma language_version >= 0.23` and compile before deployment; Compact is pre-1.0 and evolves quickly.
- Derive `localSecretKey` per contract to avoid cross-application linkability.
- A long-lived deployment should update or securely source `referenceYear` instead of treating it as permanent.
- The current interface deliberately simulates wallet proof submission so the complete interaction can be reviewed without a deployed contract.
