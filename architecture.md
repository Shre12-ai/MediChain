# MedChain — System Architecture

## 1. High-Level Overview
MedChain is a three-tier system layering a React frontend and an Express/MongoDB backend on
top of an Ethereum-compatible blockchain (Solidity smart contracts, run locally via Hardhat). The
backend acts as a bridge: it persists rich off-chain metadata in MongoDB while the blockchain
holds the authoritative, tamper-resistant record of batch state, custody transfers, flags, and trust
scores.

```
 ┌────────────────────┐
 │   React Frontend    │  (Vite, apothecary-ledger UI)
 │  QR scan / dashboards│
 └─────────┬────────────┘
           │ REST (Axios/fetch)
 ┌─────────▼────────────┐
 │  Express Backend      │
 │  - Auth / RBAC         │
 │  - Off-chain metadata │◄──────► MongoDB (Docker)
 │  - ethers.js bridge    │
 └─────────┬────────────┘
           │ JSON-RPC (ethers.js)
 ┌─────────▼────────────┐
 │  Hardhat Local Node    │
 │  Solidity Contracts    │
 │  - Batch registry       │
 │  - Custody transfer     │
 │  - Flagging              │
 │  - Trust scoring         │
 └────────────────────────┘
```

## 2. Component Breakdown

### 2.1 Smart Contract Layer (Solidity + Hardhat)
- **Batch Registration** — manufacturers register a batch with a cryptographic hash of batch
  details (batch number, manufacturing date, expiry date), tied to a role-gated function.
- **Custody Transfer** — each transfer between roles (manufacturer → distributor → wholesaler →
  pharmacy) is a contract call that validates the caller's role and current holder before recording
  the new custody state, preserving an immutable chain-of-custody trail.
- **Integrity Checks** — hash recomputation on scan/verify catches mismatches, duplicate scans,
  or missing entries.
- **Flagging** — any role (primarily pharmacist/customer) can flag a batch; the flag is written
  on-chain and attributed to the node that last held custody.
- **Dynamic Trust Scoring** — an on-chain (or contract-triggered) score per node, computed from
  the ratio of clean verifications to reports; sharp drops can trigger alerts.
- **Role-Based Access Control (RBAC)** — enforced at the contract level so only the correct role
  can perform an action at each stage of the batch lifecycle.

### 2.2 Backend Layer (Express + MongoDB + ethers.js)
- Bridges off-chain metadata (extended batch descriptions, user profiles, QR assets, images) with
  on-chain state (hashes, custody events, flags, trust scores).
- Exposes REST endpoints consumed by the frontend for registration, transfers, scans, reports,
  and dashboards.
- Uses ethers.js to sign/send transactions to the Hardhat node and to read contract state.
- Includes a **seed script** that drives an end-to-end demo flow (register → transfer chain →
  scan → flag) for reproducible demos.

### 2.3 Frontend Layer (React + Vite)
- **Apothecary-ledger** visual identity: sage-paper background, deep green/rust palette,
  serif/mono typography (Libre Caslon headings, IBM Plex Sans body, IBM Plex Mono data).
- Role-specific views (manufacturer registration form, distributor/wholesaler/pharmacist custody
  actions, customer scan/verify screen).
- **Animated ink authentication stamp** for verification results (genuine / flagged / expired).
- **Passport-stamp-style custody history trail** visualizing the chain of custody per batch.
- **Ledger-spine sidebar** for navigation.

### 2.4 Data Storage
- **MongoDB (via Docker container `medchain-mongo`)** — off-chain metadata, user accounts,
  cached batch/QR data for fast reads.
- **Hardhat in-memory chain** — authoritative on-chain state (batches, custody events, flags,
  trust scores). This chain is **ephemeral** and resets on every Hardhat node restart.

## 3. Data Flow (Verification Path)
1. Customer scans a batch's QR code in the React app.
2. Frontend sends the QR payload to the Express backend.
3. Backend resolves the batch reference, queries the smart contract via ethers.js, and
   recomputes/compares the cryptographic hash.
4. Backend cross-references MongoDB for supplementary metadata (e.g. manufacturer details).
5. Result (genuine / flagged / expired / mismatch) is returned to the frontend and rendered via the
   ink-stamp verification animation, alongside the passport-stamp custody trail.

## 4. Deployment Architecture (Local / Windows)
- **MongoDB** runs in Docker (`mongo:7` image), not installed natively.
- **Hardhat node** runs as an in-memory local blockchain — all chain state resets on restart.
- **Backend** (`npm run dev`) connects to both MongoDB and the Hardhat node.
- **Frontend** (`npm run dev`, Vite) is a separate client process.
- Correct startup order matters because later services depend on the chain/DB being live and
  freshly deployed (see `memory.md` for the exact sequence and known gotchas).

## 5. Key Architectural Decisions
| Decision | Rationale |
|---|---|
| Hybrid on-chain/off-chain storage | Keep trust-critical data (hashes, custody, flags, trust score) immutable on-chain; keep bulky/mutable metadata cheap and flexible in MongoDB |
| Local Hardhat chain for demo | No cost/latency of a public testnet; simpler, reproducible college-project demo |
| QR + hash instead of RFID/NFC | No specialized hardware needed; works with any smartphone camera |
| Role-gated smart contract functions | Ensures custody can only move in the correct direction and by the correct actor |
| Reputation/trust score | Turns verification from a static one-way lookup into a self-correcting network signal |
