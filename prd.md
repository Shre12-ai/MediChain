# MedChain — Product Requirements Document (PRD)

## 1. Overview
MedChain is a blockchain-based medicine batch verification system built to combat counterfeit
drugs in fragmented pharmaceutical supply chains. It lets every stakeholder — manufacturer,
distributor, wholesaler, pharmacist, and end customer — register, transfer, and verify a medicine
batch's authenticity in real time using an on-chain, tamper-resistant audit trail combined with a
crowdsourced trust-scoring layer.

**Project type:** College mini project (BCS-554), Pranveer Singh Institute of Technology,
Dept. of CSE, Session 2026–27.

## 2. Problem Statement
Counterfeit medicines are a major public-health threat, especially where drug supply chains are
fragmented. Patients and even pharmacists often cannot tell a genuine strip from a fake, because
packaging is cheap to replicate and centralized verification databases can be altered by insiders.
Paper-trail and centralized-server tracking systems lack transparency and are vulnerable to
manipulation at any handoff between manufacturer and consumer. The result: substandard or
fake drugs reaching the market, health risk, eroded trust, and financial loss for legitimate
manufacturers.

**Need:** a tamper-proof, transparent, easily accessible way for every stakeholder — and the end
consumer — to verify a medicine's authenticity in real time before purchase or consumption.

## 3. Goals
- Give every medicine batch a verifiable, cryptographically-linked digital identity from the moment
  of manufacture.
- Make every custody transfer (manufacturer → distributor → wholesaler → pharmacy → customer)
  immutable and auditable on-chain.
- Let a customer verify a medicine in seconds with nothing more than a smartphone camera.
- Detect and flag counterfeit or suspicious batches automatically (hash mismatch, duplicate scan,
  missing ledger entry).
- Build a self-correcting network via crowdsourced reporting and a dynamic trust score per
  supply-chain node, rather than a static one-way lookup.

## 4. Non-Goals (Out of Scope for MVP)
- Real-world regulatory integration / legal enforcement action on flagged nodes.
- Production-grade mainnet deployment (project runs on a local Hardhat chain for demo purposes).
- Hardware-based tracking (RFID, NFC tags) — explicitly avoided by design.
- Payments, insurance, or pharmacy inventory/ERP functionality.

## 5. Users & Roles
| Role | Primary Needs |
|---|---|
| Manufacturer | Register new batches, mint QR-linked hash, view own batch history |
| Distributor | Accept custody, transfer to wholesaler, view trust score |
| Wholesaler | Accept custody, transfer to pharmacy, view trust score |
| Pharmacist | Accept custody, sell/dispense, flag suspicious batches |
| Customer | Scan QR, verify authenticity/expiry/history, report suspicious batch |
| Regulator (implicit, future) | Monitor trust-score alerts across the network |

Access is role-based; each role can only perform actions permitted to its position in the chain
(enforced in the smart contract and backend).

## 6. Core Features
1. **Batch Registration** — manufacturer registers a batch (batch number, manufacturing date,
   expiry date); a unique QR code is generated, linked to a cryptographic hash of batch details.
2. **Custody Chain Transfers** — each handoff (distributor/wholesaler/pharmacy) is logged on-chain
   via a smart contract with integrity checks, forming an immutable audit trail.
3. **QR-Based Verification** — customer/pharmacist scans the QR code; the app queries the chain,
   recomputes the hash, and confirms authenticity, batch history, and expiry status instantly.
4. **Automatic Flagging** — any hash mismatch, duplicate scan, or missing ledger entry flags the
   batch as potentially counterfeit.
5. **Crowdsourced Reporting** — any pharmacist or consumer can report a suspicious batch from the
   app; the report is written on-chain and linked to the node (distributor/pharmacy) that last held it.
6. **Dynamic Trust Scoring** — each supply-chain node accumulates a trust score from the ratio of
   clean scans to reports against it; a sharp score drop triggers an automatic alert.
7. **No Specialized Hardware** — verification works with any smartphone camera, no RFID/NFC
   readers required, making it deployable in low-resource pharmacy settings.

## 7. Differentiation
Existing anti-counterfeit approaches (holograms, serialized barcodes) depend on centralized
verification servers that can be spoofed or edited by insiders. Existing blockchain pharma
platforms are largely one-way manufacturer-to-distributor tracking with no feedback loop.
MedChain combines consumer-facing QR verification with a reputation-scored reporting network,
requiring no specialized hardware, and gets smarter (self-correcting) as more people use it.

## 8. Success Criteria (for demo/evaluation)
- End-to-end flow works locally: register → transfer through all roles → scan/verify → flag → trust
  score updates.
- A tampered or duplicate scan is correctly detected and flagged.
- Reproducible local deployment following the documented startup sequence.
- UI clearly communicates verification result (genuine / flagged / expired) and custody history.

## 9. Future Scope
- AI-based anomaly detection on scan patterns.
- IoT integration (cold-chain sensors, tamper-evident packaging sensors).
- Wider healthcare system integration (pharmacy ERPs, national drug regulators).
- Stronger monitoring/alerting dashboards for regulators.
- Migration from local Hardhat chain to a public/consortium testnet or mainnet.

## 10. Tech Stack Summary
- **Smart contracts:** Solidity (Hardhat)
- **Backend:** Node.js / Express + MongoDB, ethers.js bridge to chain
- **Frontend:** React (Vite)
- **Wallet/chain interaction:** MetaMask, Hardhat local node
- **QR:** qrcode.js (or equivalent QR generation library)
- **Dev tools:** Remix IDE, Hardhat, VS Code
