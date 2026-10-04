# MedChain — Rules & Conventions

## 1. Role-Based Access Control (RBAC)
Every on-chain action is gated by role. A caller may only perform actions permitted to their
current role at the batch's current stage in the chain of custody.

| Role | Allowed Actions |
|---|---|
| Manufacturer | Register a new batch; hand off custody to a distributor |
| Distributor | Accept custody from manufacturer; transfer custody to a wholesaler |
| Wholesaler | Accept custody from distributor; transfer custody to a pharmacy |
| Pharmacist | Accept custody from wholesaler; dispense/sell to customer; flag suspicious batches |
| Customer | Scan/verify a batch; report a suspicious batch |

**Rule:** custody can only move forward one step at a time, in the fixed order
`Manufacturer → Distributor → Wholesaler → Pharmacist → Customer`. A role cannot skip a stage or
transfer custody it does not currently hold.

## 2. Batch Registration Rules
- A batch must include: batch number, manufacturing date, expiry date.
- A cryptographic hash of these details is computed at registration and stored on-chain as the
  batch's integrity anchor.
- A unique QR code is generated and cryptographically linked to that hash — the QR itself is not
  the source of truth, the on-chain hash is.
- A batch number must be unique; duplicate registration of the same batch number is rejected.

## 3. Custody Transfer Rules
- Every transfer must be signed by the current custody holder (not a downstream or upstream
  party).
- Each transfer is recorded immutably on-chain with timestamp, sender role, and receiver role.
- A transfer is rejected if the sender is not the current recorded custodian, preventing
  out-of-order or spoofed handoffs.

## 4. Verification Rules
- Verification recomputes the batch's cryptographic hash from current on-chain data and compares
  it against the stored hash at registration.
- A batch is flagged **automatically** if any of the following occur:
  - Recomputed hash does not match the stored hash (tampering indicator).
  - The QR code has already been scanned/verified as "final" (duplicate scan).
  - No corresponding ledger entry exists for the scanned batch (missing record).
- Expiry status is checked against the current date; an expired batch is reported as expired
  regardless of authenticity.

## 5. Reporting Rules
- Any pharmacist or customer may submit a suspicious-batch report from the app.
- A report is written on-chain and attributed to the supply-chain node that last held custody of
  the batch (not to the reporter, to protect anonymity while preserving accountability of nodes).
- Reports cannot be deleted or edited once submitted — only new reports/scans affect a node's
  score going forward.

## 6. Trust Scoring Rules
- Each supply-chain node (distributor, wholesaler, pharmacy) accumulates a **dynamic trust
  score** derived from the ratio of clean verifications to reports associated with it.
- A sharp drop in a node's trust score triggers an automatic alert (early-warning signal, in place
  of periodic manual audits).
- Trust score is a network-level, self-correcting signal — it is not a one-time or static rating.

## 7. General Engineering Conventions
- **No specialized hardware assumptions:** all verification flows must work with a standard
  smartphone camera (QR scanning only) — do not introduce dependencies on RFID/NFC or other
  hardware.
- **On-chain vs off-chain split:** trust-critical, immutable data (hashes, custody events, flags,
  trust scores) lives on-chain; bulky or mutable descriptive metadata lives in MongoDB. Do not
  store trust-critical fields off-chain only.
- **Local dev chain is ephemeral:** never assume Hardhat node state persists across restarts;
  always redeploy and reseed after a chain restart (see `memory.md`).
- **Distributable packaging:** exclude `node_modules`, build artifacts, and generated
  ABI/deployment files from any distributed/zipped copy of the project.

## 8. Presentation/Documentation Conventions
- Headings font size 14, content font size 12, single spacing, Times New Roman — required
  formatting for the official proposal document (per faculty guidelines).
- One proposal is submitted per team, by the team leader only; maximum team size is 5 members.
