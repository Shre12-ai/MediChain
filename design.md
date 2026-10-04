# MedChain — Design Document (Visual & UX)

## 1. Design Concept: "Apothecary Ledger"
MedChain's frontend uses an **apothecary-ledger** visual identity — the feel of an old
pharmacist's record book combined with a modern verification tool. The metaphor reinforces the
product's core promise: a trustworthy, permanent, inspectable record of a medicine's journey.

## 2. Color Palette
- **Background:** sage-paper — a muted, warm off-white/sage tone evoking aged ledger paper.
- **Primary accents:** deep green and rust — used for headers, action states, and the
  authentication stamp, echoing ink and wax-seal tones.
- Verification states use the same palette family: genuine (deep green), flagged/suspicious
  (rust/red), expired (muted neutral) — keeping the whole system visually coherent rather than
  introducing generic red/green/yellow alert colors.

## 3. Typography
| Role | Font |
|---|---|
| Headings | Libre Caslon (serif) |
| Body text | IBM Plex Sans |
| Data / on-chain values (hashes, batch IDs, timestamps) | IBM Plex Mono |

The serif/mono pairing separates "narrative" content (headings, descriptions) from "record"
content (immutable, precise data), visually reinforcing what's stored on-chain vs. what's
descriptive metadata.

## 4. Signature UI Components

### 4.1 Animated Ink Authentication Stamp
Used to present verification results. On scan, a stamp animation "presses" onto the screen —
mimicking a notary/customs stamp — to deliver a genuine/flagged/expired verdict. This gives the
verification moment a tactile, authoritative feel rather than a plain success/error banner.

### 4.2 Passport-Stamp-Style Custody History Trail
Each custody transfer (manufacturer → distributor → wholesaler → pharmacy) is rendered as a
stamp in a passport-style trail, in chronological order. This makes the chain-of-custody legible at
a glance and reinforces the "journey" narrative of a single batch.

### 4.3 Ledger-Spine Sidebar
Primary navigation is styled as the spine of a ledger book, keeping role-specific sections
(Register, Transfer, Verify, Reports, Trust Scores) organized like chapters in a physical record.

## 5. Role-Specific Screens
- **Manufacturer:** batch registration form (batch number, mfg/expiry dates), QR generation view.
- **Distributor / Wholesaler / Pharmacist:** custody acceptance/transfer action, current batch list,
  node trust score view.
- **Pharmacist / Customer:** QR scan screen, verification result (ink stamp), custody trail,
  suspicious-batch reporting form.
- **Regulator (future):** trust-score alert dashboard across all nodes.

## 6. Design Principles
1. **Trust through texture, not gloss** — a paper/ledger aesthetic over glossy fintech UI, to signal
   permanence and record-keeping rather than transactional speed.
2. **Data is sacred, presentation is warm** — on-chain data (hashes, timestamps, IDs) is always
   rendered in mono type, unaltered; narrative UI around it can be more expressive.
3. **One verdict, unmistakably shown** — the ink-stamp pattern ensures the verification result is
   never ambiguous or buried in secondary text.
4. **Chain-of-custody as a story** — the passport-stamp trail turns an audit log into something a
   non-technical user (a customer) can read and understand instantly.
5. **No specialized hardware, no complex UI** — screens are optimized for a phone camera and
   simple taps; the target user in a low-resource pharmacy setting should never need training.

## 7. Accessibility & Usability Notes
- Verification verdicts should be distinguishable by more than color alone (icon/shape + text),
  given the palette leans on similar warm tones.
- Mono-spaced data blocks (hashes) should support easy copy/selection for power users
  (pharmacists, regulators) without breaking the stamp/trail visuals for end customers.
