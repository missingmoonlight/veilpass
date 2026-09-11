# Build a Compact ZK proof demo

## Goal
Create a polished working prototype where a user proves they are over 18 without revealing their birth year, then submits the proof result to a Compact smart contract flow.

## What I’ll build
- A focused single-screen “VeilPass” app with wallet connection, private input, proof generation, verification, and transaction states.
- A Compact contract for age eligibility and nullifier-based replay protection, plus a short contract README explaining how it coordinates with the interface.
- A local proof simulation for the live preview, clearly labeled as a demo so the complete interaction works without requiring a browser wallet or deployed network.
- Responsive visual states, transaction history, privacy details, and clear success/error feedback.

## Technical details
- React state machine for disconnected, ready, proving, proved, submitting, and verified states.
- Web Crypto for deterministic demo commitments and nullifiers; the raw birth year remains in memory only and is never shown in transaction records.
- Semantic design tokens in the global stylesheet and accessible controls.
- Compact source kept as a separate contract artifact, modeled after current Midnight Compact conventions.
- Route-specific metadata and verification in the running preview.

## Scope boundary
This delivers a coordinated, runnable frontend demonstration and Compact contract source. A production deployment still requires the Midnight toolchain, a funded wallet, network configuration, and generated contract bindings.
