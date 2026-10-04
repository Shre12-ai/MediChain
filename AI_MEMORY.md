# MedChain — AI Memory & Session State Tracker

*This document maintains continuous operational and architectural memory for AI sessions working on the MedChain project.*

---

## 1. Project Snapshot
- **Project Name:** MedChain (BCS-554 College Mini Project, CSE Dept)
- **Architecture:** 3-Tier Full-Stack Decentralized Application
  - **Blockchain Layer:** Solidity `MedChain.sol` (Solidity 0.8.24, viaIR enabled) on local Hardhat Node (Chain ID `31337`)
  - **Database Layer:** **Supabase Cloud PostgreSQL Database** (`https://ubfnptxtojmglbunzyaz.supabase.co`) with Mongoose/MongoDB fallback
  - **Backend Layer:** Express REST API + Ethers.js v6
  - **Frontend Layer:** React 18 + Vite + Tailwind CSS with the *Apothecary-Ledger* visual identity
- **Live Service Status (ACTIVE NOW):**
  - **Database:** Supabase Cloud Database connected and seeded (`batches`, `node_profiles`, `reports` tables)
  - **Blockchain Node:** `http://127.0.0.1:8545` (Chain ID: `31337`)
  - **Contract Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
  - **Backend API:** `http://localhost:5000`
  - **Frontend Client:** `http://localhost:3000`

---

## 2. Supabase Tables & Cloud Data
1. **`batches`**:
   - `MED-2026-001` (Amoxicillin 500mg)
   - `MED-2026-002` (Paracetamol 650mg)
   - `MED-2026-003` (Azithromycin 250mg)
2. **`node_profiles`**:
   - 5 participants (Apex Pharma Labs, NorthStar Logistics, Metro Wholesale Drug Corp, St. Jude Community Pharmacy, Demo Patient)
3. **`reports`**:
   - Suspicious tamper report for `MED-2026-003`

---

## 3. Configured Supply Chain Demo Personas & Wallets
| Persona | Name | Hardhat Signer Index | Public Address | Role ID |
|---|---|---|---|---|
| **Manufacturer** | Apex Pharma Labs (Mfg) | Account #0 | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `1` |
| **Distributor** | NorthStar Logistics (Dist) | Account #1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `2` |
| **Wholesaler** | Metro Wholesale Drug Corp | Account #2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `3` |
| **Pharmacist** | St. Jude Community Pharmacy | Account #3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `4` |
| **Customer** | Demo Patient / End Consumer | Account #4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `5` |
