# MedChain — Decentralized Pharmaceutical Supply Chain & Verification System

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.x-FFF100?logo=ethereum)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Cloud-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-9%2F9%20Passing-brightgreen)](#smart-contract-tests)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An Ethereum-compatible full-stack decentralized application engineered to eliminate counterfeit pharmaceuticals through cryptographic batch anchoring, strict sequential chain-of-custody enforcement, live camera QR code authentication, crowdsourced tamper incident reporting, and an on-chain dynamic node reputation scoring algorithm.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                              │
│         React 18 + Vite + Tailwind CSS (Apothecary-Ledger Theme)       │
│   • Live Camera QR Scanner • Animated Ink Stamps • Passport Visa Trail  │
│   • Admin Access Portal    • Interactive Role Switcher                 │
└───────────────────▲────────────────────────────────▲───────────────────┘
                    │                                │
             REST / JSON                      WebSocket / HTTP
                    │                                │
┌───────────────────▼────────────────────────────────┴───────────────────┐
│                          APPLICATION & API LAYER                       │
│                     Node.js + Express REST API Server                  │
│   • /api/batches     • /api/nodes     • /api/reports   • /api/admin    │
└──────────────▲─────────────────────────────────────────────▲───────────┘
               │                                             │
      Ethers.js v6 RPC                              PostgREST / Mongoose
               │                                             │
┌──────────────▼──────────────────────────┐    ┌─────────────▼───────────┐
│             BLOCKCHAIN LAYER            │    │      DATABASE LAYER     │
│       Solidity 0.8.24 Smart Contract    │    │  Supabase Cloud DB      │
│   • Keccak256 Batch Hashing             │    │  (PostgreSQL + RLS)     │
│   • Role-Based Access Control (RBAC)    │    │  • Batch Metadata       │
│   • Sequential Chain of Custody         │    │  • High-Res QR Labels   │
│   • Dynamic Trust Score Calculation     │    │  • User Access Requests │
└─────────────────────────────────────────┘    └─────────────────────────┘
```

---

## 👥 Supply Chain Roles & Permissions

MedChain implements strict cryptographic Role-Based Access Control (RBAC):

| Role | Role ID | Permitted Actions & Use Case |
|---|:---:|---|
| **Administrator** | `Owner` | Reviews access requests, approves/rejects users, and assigns cryptographic roles directly on the smart contract. |
| **Manufacturer** | `1` | Registers new batches, mints Keccak256 cryptographic anchors on-chain, and generates authentic QR codes. |
| **Distributor** | `2` | Accepts custody from Manufacturer, logs cold-chain temperature conditions, and transfers to Wholesaler. |
| **Wholesaler** | `3` | Receives bulk shipments from Distributor, verifies packaging seals, and supplies community pharmacies. |
| **Pharmacist** | `4` | Accepts medicine from Wholesaler, dispenses to Patients, and holds permission to flag suspicious batches. |
| **Customer / Patient** | `5` | Scans physical QR codes with phone/webcam camera, reviews the chronological passport trail, and files tamper alerts. |

---

## ✨ Key Technical Highlights

1. **Cryptographic Batch Anchoring**:
   $$\text{BatchHash} = \text{keccak256}(\text{batchNumber}, \text{mfgDate}, \text{expDate})$$
   Recomputed and verified on-chain at every scan to prevent database forgery.

2. **Strict Sequential State Machine**:
   Custody transitions follow an unskippable sequence:
   $$\text{Manufacturer} \longrightarrow \text{Distributor} \longrightarrow \text{Wholesaler} \longrightarrow \text{Pharmacist} \longrightarrow \text{Customer}$$
   Any out-of-order handoff reverts on the smart contract level.

3. **On-Chain Dynamic Trust Scoring Algorithm**:
   $$\text{Trust Score} = \left\lfloor \frac{\text{CleanVerifications} \times 100}{\text{CleanVerifications} + (\text{ReportsAgainst} \times 5)} \right\rfloor$$
   If an entity's score drops below **70%**, an automatic on-chain `TrustAlertTriggered` event is emitted.

4. **Interactive Apothecary-Ledger Visual Identity**:
   - Three distinct physical-style ink authentication stamps (`GENUINE`, `FLAGGED`, `EXPIRED`) with authentic stamp-press physics.
   - Chronological visa-stamp custody trail recording each station's timestamp, operator address, and notes.

5. **Camera QR Code Scanner**:
   Integrated via `html5-qrcode` to enable instant scanning from physical medicine packaging using standard laptop webcams or mobile cameras.

6. **Admin Portal & User Registration**:
   - Public multi-step registration form for participants to request access based on their supply chain role.
   - Admin management dashboard to approve, reject, or revoke access with automatic blockchain role binding.

---

## 🚀 Quickstart Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/<YOUR-USERNAME>/MedChain.git
cd MedChain
```

### 2. Install Dependencies
```bash
# Install root, contracts, server, and client packages
npm install
cd contracts && npm install && cd ..
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Configure Environment Variables
Copy `.env.example` in `server/` to `server/.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
ADMIN_KEY=medchain-admin-2026
```

### 4. Run the Project
Open 3 terminals:

```powershell
# Terminal 1: Start Local Blockchain
npm run node

# Terminal 2: Deploy Contracts & Start Backend
npm run deploy:local
npm run seed
npm run server

# Terminal 3: Start Frontend Client
npm run client
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 🧪 Smart Contract Tests

MedChain includes a comprehensive test suite with **100% pass rate across 9 unit tests**:

```bash
cd contracts
npx hardhat test
```

```
  MedChain Comprehensive Test Suite
    ✔ 1. Should set deployer as owner and Genesis Manufacturer
    ✔ 2. Should allow owner to assign roles to participants
    ✔ 3. Should allow Manufacturer to register a batch
    ✔ 4. Should REVERT if non-Manufacturer tries to register a batch
    ✔ 5. Should successfully execute sequential custody transfer
    ✔ 6. Should REVERT on illegal custody skips (Manufacturer -> Wholesaler)
    ✔ 7. Should increment scan count and verify authentic batch
    ✔ 8. Should flag suspicious batch and degrade node trust score
    ✔ 9. Should finalize batch when dispensed to customer

  9 passing (1.8s)
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
