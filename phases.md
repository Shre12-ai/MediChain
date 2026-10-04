# MedChain — Development Phases

## Phase 0: Proposal & Problem Definition
- Defined problem statement: counterfeit medicines, fragmented supply chains, lack of
  transparent/tamper-proof verification.
- Defined proposed solution: blockchain-based batch registration + QR verification + custody
  chain + crowdsourced trust scoring.
- Documented hardware/software requirements and team roles.
- **Output:** Mini Project Proposal (BCS-554).

## Phase 1: Smart Contract Layer
- Designed batch data model (batch number, manufacturing date, expiry date, cryptographic hash).
- Implemented role-based access control for manufacturer, distributor, wholesaler, pharmacist.
- Implemented batch registration function.
- Implemented custody transfer function with integrity checks between roles.
- Implemented flagging mechanism for suspicious batches.
- Implemented dynamic trust-scoring logic per supply-chain node.
- Set up Hardhat local network and deployment scripts.

## Phase 2: Backend Layer
- Built Express server and defined REST API surface (registration, transfer, scan/verify, report).
- Integrated MongoDB (via Docker) for off-chain metadata storage.
- Integrated ethers.js to bridge backend ↔ smart contracts (read/write on-chain state).
- Built a seed script to drive a reproducible end-to-end demo flow (register → transfer chain →
  scan → flag).

## Phase 3: Frontend Layer
- Built role-specific screens in React (Vite): registration, custody transfer, QR scan/verify,
  reporting, trust-score views.
- Implemented QR code generation and scanning flow.
- Applied the apothecary-ledger visual identity (palette, typography).
- Built signature components: animated ink authentication stamp, passport-stamp custody trail,
  ledger-spine sidebar.

## Phase 4: Integration & End-to-End Testing
- Connected frontend ↔ backend ↔ smart contracts across the full batch lifecycle.
- Verified hash-mismatch, duplicate-scan, and missing-record detection paths trigger correct
  flagging behavior.
- Verified trust score updates correctly from clean scans vs. reports.
- Established and documented the correct local startup sequence (Docker → Hardhat → deploy →
  backend → seed → frontend) and resolved sync issues between chain and DB.

## Phase 5: Packaging & Demo Readiness
- Cleaned build artifacts, `node_modules`, and generated ABI/deployment files from the
  distributable package (~152KB zip).
- Confirmed project builds cleanly from a fresh clone/extract.
- Prepared presentation materials (problem, solution, architecture, features, feasibility,
  conclusion) for team presentation.
- **Status:** demo-ready for college submission.

## Phase 6 (Future Scope — Not Yet Started)
- AI-based anomaly detection on scan/report patterns.
- IoT integration (e.g. cold-chain sensors, tamper-evident packaging signals).
- Wider healthcare system integration (pharmacy ERPs, national drug regulator systems).
- Stronger regulator-facing monitoring and alerting dashboards.
- Migration from local Hardhat chain to a public or consortium blockchain network.
