const express = require("express");
const router = express.Router();
const UserService = require("../models/User");

// POST /api/users/register - New user submits their registration request
router.post("/register", async (req, res) => {
  try {
    const { name, email, wallet_address, role, facility_name, license_number, contact_phone, reason_for_access } = req.body;

    if (!name || !email || !wallet_address || !role) {
      return res.status(400).json({ error: "name, email, wallet_address, and role are required." });
    }

    const validRoles = ['manufacturer', 'distributor', 'wholesaler', 'pharmacist', 'customer'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(", ")}` });
    }

    // Check if wallet already registered
    const existing = await UserService.findByAddress(wallet_address);
    if (existing) {
      return res.status(409).json({
        error: "This wallet address is already registered.",
        status: existing.status,
        role: existing.role,
      });
    }

    const user = await UserService.create({
      name,
      email,
      wallet_address: wallet_address.toLowerCase(),
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
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/status/:address - Check registration status by wallet address
router.get("/status/:address", async (req, res) => {
  try {
    const user = await UserService.findByAddress(req.params.address);
    if (!user) {
      return res.status(404).json({ error: "No registration found for this address." });
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
