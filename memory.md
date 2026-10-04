# MedChain — Project Memory / Dev Context

This document captures operational knowledge and gotchas for running and developing MedChain
locally, so the team doesn't relearn them each session.

## 1. Project Snapshot
- **What it is:** full-stack blockchain-based medicine batch verification system (college mini
  project, BCS-554).
- **Stack:** Solidity smart contracts (Hardhat) · Express/MongoDB backend with ethers.js · React
  (Vite) frontend.
- **Environment:** deployed and run locally on a Windows machine.
- **Status:** fully built and locally deployable, with the apothecary-ledger frontend redesign
  complete. Builds cleanly; final distributable zip (~152KB) excludes `node_modules`, build
  artifacts, and generated ABI/deployment files. Demo-ready for college submission.

## 2. Correct Local Startup Order (must follow every session)
1. Start Docker Desktop
2. `docker start medchain-mongo` (or `docker run -d -p 27017:27017 --name medchain-mongo mongo:7` on first run)
3. `npx hardhat node`
4. `npm run deploy:local`
5. `npm run dev` (server)
6. `npm run seed`
7. `npm run dev` (client)

## 3. Known Gotchas
- **Hardhat node is in-memory** — its state resets on every restart. After any chain restart, you
  must fully redeploy contracts, restart the backend, and reseed data.
- **Seed script failing mid-run** leaves chain and MongoDB out of sync (e.g. a batch registered
  on-chain but missing from MongoDB). Fix: restart the Hardhat node to reset chain state, then
  reseed from a clean slate.
- **`UV_HANDLE_CLOSING` crash** shown after Hardhat deployment on Windows is cosmetic/harmless
  — the deployment still completes successfully. Don't treat it as a failure.
- **MongoDB is not installed natively** — it runs via Docker. Use `docker run` on first setup and
  `docker start medchain-mongo` afterward.

## 4. Design/Frontend Reference
- Visual identity: apothecary-ledger — sage-paper background, deep green/rust palette,
  serif/mono typography.
- Fonts: Libre Caslon (headings), IBM Plex Sans (body), IBM Plex Mono (data).
- Signature components: animated ink authentication stamp (verification result), passport-stamp
  custody history trail, ledger-spine sidebar navigation.
- See `design.md` for full detail.

## 5. Smart Contract Capabilities (recap)
- Role-based batch registration
- Custody transfers with integrity checks
- Flagging of suspicious batches
- On-chain verification (hash recomputation)
- Dynamic trust scoring per supply-chain node

## 6. Open Items / Not Yet Decided
- No explicitly stated next steps beyond the current demo-ready state.
- Future scope (from PRD): AI-based anomaly detection, IoT integration, wider healthcare system
  integration, stronger regulator-facing monitoring, and eventual migration off the local Hardhat
  chain to a public/consortium network.

## 7. Quick Troubleshooting Checklist
- App behaving oddly / verification failing unexpectedly → check whether Hardhat node was
  restarted without a full redeploy + reseed.
- Backend can't reach DB → confirm Docker Desktop is running and `medchain-mongo` container is
  started.
- Deployment terminal shows an error after "deployment successful" → check if it's the known
  `UV_HANDLE_CLOSING` cosmetic crash before assuming failure.

## 8. Live AI Session Memory
- Active state tracker: see `AI_MEMORY.md` in this directory for live component status, last actions completed, and next immediate tasks.

