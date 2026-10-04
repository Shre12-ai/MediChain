# MedChain — AI Memory & Session State Tracker

*This document maintains continuous operational and architectural memory for AI sessions working on the MedChain project.*

---

## 1. Project Snapshot
- **Project Name:** MedChain (BCS-554 College Mini Project, CSE Dept)
- **Architecture:** 3-Tier Full-Stack Decentralized Application
  - **Blockchain Layer:** Solidity `MedChain.sol` (Solidity 0.8.24, viaIR enabled) on local Hardhat Node (Chain ID `31337`)
  - **Database Layer:** **Supabase Cloud PostgreSQL Database** (`https://ubfnptxtojmglbunzyaz.supabase.co`) with MongoDB & in-memory fallback
  - **Backend Layer:** Express REST API + Ethers.js v6
  - **Frontend Layer:** React 18 + Vite + Tailwind CSS with the *Apothecary-Ledger* visual identity
- **Authentication & Role Security:**
  - Real **Login Portal** (`LoginView.jsx`) replacing the old demo-switching mechanism.
  - Strict role-based feature gating: each user only sees and accesses features permitted for their role.
  - Pending approval block: Users who register must be approved by Admin in the Admin Portal before gaining access.
  - Station logout button (`Exit Station`) to sign out and switch accounts.
- **Git Repository Status:**
  - Branch: `main`
  - Latest Commit: `7e7da43` ("feat: real authentication portal with role-based access gating, pending review blocking, and station logout")
  - GitHub Actions CI workflow: `.github/workflows/test.yml` (9/9 automated tests passing)

---

## 2. Role-Based Feature Permissions Matrix

| Role | Permitted Chapters in Sidebar | Restricted / Hidden Actions |
|---|---|---|
| **Manufacturer** | • Verify Batch (Ch. I)<br>• Register Batch (Ch. II)<br>• Custody Handoff (Ch. III)<br>• Trust Scores (Ch. IV) | Cannot access Admin Portal or file incident reports as dispenser. |
| **Distributor** | • Verify Batch (Ch. I)<br>• Custody Handoff (Ch. III)<br>• Trust Scores (Ch. IV) | **Cannot register new batches** (Manufacturer-only). |
| **Wholesaler** | • Verify Batch (Ch. I)<br>• Custody Handoff (Ch. III)<br>• Trust Scores (Ch. IV) | **Cannot register new batches**. |
| **Pharmacist** | • Verify Batch (Ch. I)<br>• Custody Handoff / Dispense (Ch. III)<br>• Report Incident (Ch. V)<br>• Trust Scores (Ch. IV) | **Cannot register new batches**. |
| **Customer** | • Verify Batch (Ch. I - Camera QR Scanner)<br>• Report Incident (Ch. V) | **Cannot register batches or perform custody transfers**. |
| **Admin** | • All 5 Ledger Chapters + **Admin Portal** | Reviews, approves, rejects, and assigns on-chain roles. |

---

## 3. Pre-Configured Accounts for Demonstration
Password for all demo accounts: `password123` (or use the one-click preset buttons on the login screen):
- **Admin:** `admin@medchain.io` (or password: `medchain-admin-2026`)
- **Manufacturer:** `manufacturer@apexpharma.com`
- **Distributor:** `distributor@northstar.com`
- **Wholesaler:** `wholesaler@metrodrug.com`
- **Pharmacist:** `pharmacist@stjude.org`
- **Customer:** `customer@patient.com`

---

## 4. Live Running Services
- **Hardhat Blockchain Node:** `http://127.0.0.1:8545` (Chain ID: `31337`)
- **Contract Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Backend API:** `http://localhost:5000` (Connected to Supabase cloud)
- **Frontend Client:** `http://localhost:3000`
