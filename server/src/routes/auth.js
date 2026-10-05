const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const UserService = require("../models/User");

// POST /api/auth/login — Email + password only. No wallet required.
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const cleanId = identifier.trim().toLowerCase();

    // 1. Special hardcoded admin account
    if (cleanId === "admin@medchain.io" || cleanId === "admin") {
      if (password === "medchain-admin-2026" || password === "password123") {
        return res.json({
          token: "token_admin_" + Date.now(),
          user: {
            id: "usr_admin",
            name: "System Administrator",
            email: "admin@medchain.io",
            role: "admin",
            wallet_address: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
            facility_name: "MedChain Network Operations Center",
            status: "approved",
          }
        });
      }
      return res.status(401).json({ error: "Invalid admin password." });
    }

    // 2. Find user by email
    const user = await UserService.findByEmail(cleanId);
    if (!user) {
      return res.status(404).json({
        error: "No account found with this email. Please use 'Request Access' to register."
      });
    }

    // 3. Verify password — supports both bcrypt hashes (new users) and plain text (demo accounts)
    const storedPw = user.password || "";
    let passwordOk = false;
    if (storedPw.startsWith("$2")) {
      // bcrypt hash
      passwordOk = await bcrypt.compare(password, storedPw);
    } else {
      // plain text (legacy demo accounts)
      passwordOk = (password === storedPw);
    }
    if (!passwordOk) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // 4. Check account status
    if (user.status === "pending") {
      return res.status(403).json({
        error: "Your registration request is awaiting Administrator approval.",
        status: "pending",
        user: { name: user.name, role: user.role, created_at: user.created_at }
      });
    }
    if (user.status === "rejected") {
      return res.status(403).json({
        error: "Your account access was rejected or revoked by the administrator.",
        status: "rejected",
        admin_note: user.admin_note
      });
    }

    // 5. Success
    res.json({
      token: "token_" + user.role + "_" + Date.now(),
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address,
        facility_name: user.facility_name,
        license_number: user.license_number,
        status: user.status,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/demo-login — Fast role-based login for demos/examiners
router.post("/demo-login", async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required." });

    const cleanRole = role.toLowerCase().trim();
    const allUsers = await UserService.findAll();
    const user = allUsers.find(u => u.role === cleanRole && u.status === "approved");

    if (!user) {
      return res.status(404).json({ error: `No approved account found for role: ${role}` });
    }

    res.json({
      token: "demo_token_" + cleanRole + "_" + Date.now(),
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet_address: user.wallet_address,
        facility_name: user.facility_name,
        license_number: user.license_number,
        status: user.status,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
