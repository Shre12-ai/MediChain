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
- **Git Repository Status:**
  - Branch: `main`
  - Clean initial commit: `7ae909d`
  - Excluded via `.gitignore`: `node_modules/`, `dist/`, `artifacts/`, `cache/`, `server/.env`
  - GitHub Actions CI workflow: `.github/workflows/test.yml` (9/9 automated tests)

---

## 2. Admin Portal & User Access Management System
- **Role Registration Portal (`UserRegistrationView.jsx`):**
  - Public 3-step registration flow:
    1. Select Role (`Manufacturer`, `Distributor`, `Wholesaler`, `Pharmacist`, `Customer`) with clear feature breakdown
    2. Enter Name, Email, Wallet Address, Facility Name, Drug License No., and Access Reason
    3. Instant status confirmation (`PENDING APPROVAL`)
- **Admin Management Portal (`AdminView.jsx`):**
  - Secured behind Admin Key (`medchain-admin-2026`)
  - Live registration stats (Total, Pending, Approved, Rejected, By-Role breakdown)
  - Filtering by status (`pending`, `approved`, `rejected`) and role
  - One-click actions:
    - **Approve:** Grants access & calls `assignRole()` on the MedChain smart contract
    - **Reject:** Declines access request with optional admin note
    - **Revoke:** Revokes access and sets on-chain role to 0 (`Role.None`)
- **API Endpoints:**
  - `POST /api/users/register` — Submit user access request
  - `GET /api/users/status/:address` — Check access status by wallet address
  - `GET /api/admin/users` — List all requests (requires `X-Admin-Key`)
  - `GET /api/admin/stats` — Metrics summary
  - `POST /api/admin/approve` — Approve user & assign role on-chain
  - `POST /api/admin/reject` — Reject user request
  - `POST /api/admin/revoke` — Revoke user access

---

## 3. Live Camera QR Code Scanner (`VerifyView.jsx`)
- Integrated `html5-qrcode` directly into Chapter I (Verification).
- One-click **"Scan QR"** toggle activates laptop webcam or mobile camera.
- Automatically detects and parses medicine batch QR codes (supports both JSON payloads and plain batch IDs).
- Automatically triggers on-chain cryptographic hash verification upon scan.

---

## 4. Live Running Services
- **Hardhat Blockchain Node:** `http://127.0.0.1:8545` (Chain ID: `31337`)
- **Contract Address:** `0x5FbDB2315678afecb367f032d93F642f64180aa3`
- **Backend API:** `http://localhost:5000` (Connected to Supabase cloud)
- **Frontend Client:** `http://localhost:3000`

---

## 5. Ready to Push to GitHub
```powershell
# In c:\Users\Administrator\Desktop\MediChain
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```
