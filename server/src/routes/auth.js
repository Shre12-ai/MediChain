const express = require("express");
const router = express.Router();
const UserService = require("../models/User");

// POST /api/auth/login - Login with email or wallet address + password
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Please enter your Email or Wallet Address." });
    }

    const cleanId = identifier.trim().toLowerCase();

    // 1. Check special admin login
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
      } else {
        return res.status(401).json({ error: "Invalid admin password." });
      }
    }

    // 2. Find user by email or wallet address
    let user = await UserService.findByEmail(cleanId);
    if (!user) {
      user = await UserService.findByAddress(cleanId);
    }

    if (!user) {
      return res.status(404).json({
        error: "No account found with this Email or Wallet Address. Please click 'Request Access' to register."
      });
    }

    // 3. Verify password (default is 'password123')
    if (user.password && password && user.password !== password) {
      return res.status(401).json({ error: "Incorrect password. Default for demo accounts is 'password123'." });
    }

    // 4. Verify access status
    if (user.status === "pending") {
      return res.status(403).json({
        error: "Access Pending: Your registration request is currently waiting for Administrator approval.",
        status: "pending",
        user: { name: user.name, role: user.role, created_at: user.created_at }
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        error: "Access Denied: Your account request was rejected or revoked by the administrator.",
        status: "rejected",
        admin_note: user.admin_note
      });
    }

    // 5. Successful login
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
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/demo-login - One-click fast login for examiners / demonstrators
router.post("/demo-login", async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: "Role is required." });

    const cleanRole = role.toLowerCase().trim();

    // Map role to default accounts
    const allUsers = await UserService.findAll();
    let user = allUsers.find(u => u.role === cleanRole && u.status === "approved");

    if (!user) {
      return res.status(404).json({ error: `No approved demo account found for role: ${role}` });
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
