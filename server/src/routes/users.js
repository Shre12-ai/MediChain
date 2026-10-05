const express = require("express");
const router = express.Router();
const UserService = require("../models/User");
const { ethers } = require("ethers");
const bcrypt = require("bcryptjs");

// POST /api/users/register
// Accepts: name, email, password, role + optional facility/license/phone/reason
// Wallet address is AUTO-GENERATED — users never need MetaMask or any crypto knowledge.
router.post("/register", async (req, res) => {
  try {
    const {
      name, email, password, role,
      facility_name, license_number, contact_phone, reason_for_access
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password, and role are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const validRoles = ['manufacturer', 'distributor', 'wholesaler', 'pharmacist', 'customer'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    // Check email uniqueness
    const existingByEmail = await UserService.findByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // Auto-generate a fresh Ethereum wallet for this user (custodial — server-managed)
    const generatedWallet = ethers.Wallet.createRandom();
    const wallet_address = generatedWallet.address.toLowerCase();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserService.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      wallet_address,
      role: role.toLowerCase(),
      facility_name: facility_name || "",
      license_number: license_number || "",
      contact_phone: contact_phone || "",
      reason_for_access: reason_for_access || "",
    });

    res.status(201).json({
      message: "Registration submitted successfully. Awaiting admin approval.",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/status/:email - Check registration status by email
router.get("/status/:email", async (req, res) => {
  try {
    const user = await UserService.findByEmail(req.params.email);
    if (!user) {
      return res.status(404).json({ error: "No registration found for this email." });
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      facility_name: user.facility_name,
      admin_note: user.admin_note,
      approved_at: user.approved_at,
      created_at: user.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
