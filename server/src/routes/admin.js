const express = require("express");
const router = express.Router();
const UserService = require("../models/User");
const { getContract } = require("../config/blockchain");

// Simple admin auth middleware — checks X-Admin-Key header
const ADMIN_KEY = process.env.ADMIN_KEY || "medchain-admin-2026";

const requireAdmin = (req, res, next) => {
  const key = req.headers["x-admin-key"];
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized. Invalid admin key." });
  }
  next();
};

// Role name → contract Role enum index
const ROLE_MAP = {
  manufacturer: 1,
  distributor: 2,
  wholesaler: 3,
  pharmacist: 4,
  customer: 5,
};

// GET /api/admin/users?status=pending&role=manufacturer
router.get("/users", requireAdmin, async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    const users = await UserService.findAll(filter);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await UserService.stats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/approve - Approve user & assign role on blockchain
router.post("/approve", requireAdmin, async (req, res) => {
  try {
    const { userId, admin_note } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required." });

    // Get the user
    const all = await UserService.findAll();
    const user = all.find(u => String(u.id) === String(userId));
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.status === "approved") return res.status(409).json({ error: "User already approved." });

    const roleId = ROLE_MAP[user.role];
    if (!roleId) return res.status(400).json({ error: "Invalid role in user record." });

    // Assign role on blockchain
    let txHash = null;
    try {
      const contract = getContract();
      const tx = await contract.assignRole(user.wallet_address, roleId, user.facility_name || user.name);
      const receipt = await tx.wait(1);
      txHash = receipt.hash;
    } catch (blockchainErr) {
      // Role may already be assigned on-chain, proceed with DB update
      console.warn("Blockchain assignRole note:", blockchainErr.message);
    }

    // Update DB status
    const updated = await UserService.updateStatus(userId, "approved", admin_note || "Access granted by admin.");

    res.json({
      message: `User ${user.name} approved as ${user.role} on blockchain.`,
      txHash,
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/reject - Reject a pending user
router.post("/reject", requireAdmin, async (req, res) => {
  try {
    const { userId, admin_note } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required." });

    const all = await UserService.findAll();
    const user = all.find(u => String(u.id) === String(userId));
    if (!user) return res.status(404).json({ error: "User not found." });

    const updated = await UserService.updateStatus(userId, "rejected", admin_note || "Access denied by admin.");

    res.json({
      message: `User ${user.name} rejected.`,
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/revoke - Revoke an approved user's access
router.post("/revoke", requireAdmin, async (req, res) => {
  try {
    const { userId, admin_note } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required." });

    const all = await UserService.findAll();
    const user = all.find(u => String(u.id) === String(userId));
    if (!user) return res.status(404).json({ error: "User not found." });

    // Revoke on blockchain (assign Role.None = 0)
    let txHash = null;
    try {
      const contract = getContract();
      const tx = await contract.assignRole(user.wallet_address, 0, "");
      const receipt = await tx.wait(1);
      txHash = receipt.hash;
    } catch (err) {
      console.warn("Blockchain revoke note:", err.message);
    }

    const updated = await UserService.updateStatus(userId, "rejected", admin_note || "Access revoked by admin.");

    res.json({
      message: `Access revoked for ${user.name}.`,
      txHash,
      user: updated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
