const express = require("express");
const router = express.Router();
const { getContract, HARDHAT_ACCOUNTS } = require("../config/blockchain");
const NodeProfileService = require("../models/NodeProfile");

const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Wholesaler", "Pharmacist", "Customer"];

// GET /api/nodes - List all nodes with trust scores and alerts
router.get("/", async (req, res) => {
  try {
    const contract = getContract();
    const registeredAddresses = await contract.getRegisteredNodes();

    const nodes = await Promise.all(
      registeredAddresses.map(async (address) => {
        const metrics = await contract.nodeMetrics(address);
        const score = Number(await contract.calculateTrustScore(address));
        const hardhatMatch = HARDHAT_ACCOUNTS.find(
          (a) => a.address.toLowerCase() === address.toLowerCase()
        );
        const profile = await NodeProfileService.findOne({ address });

        const clean = Number(metrics.cleanVerifications);
        const reports = Number(metrics.reportsFiledAgainst);
        const roleId = Number(metrics.role);

        return {
          address,
          name: profile?.name || metrics.name || hardhatMatch?.name || "Participant Node",
          role: profile?.role || ROLE_NAMES[roleId] || hardhatMatch?.role || "Node",
          roleId,
          trustScore: score,
          cleanVerifications: clean,
          reportsFiledAgainst: reports,
          alertTriggered: score < 70,
          profile: profile || null,
        };
      })
    );

    res.json({ nodes });
  } catch (error) {
    console.error("Fetch nodes error:", error);
    res.status(500).json({ error: error.message || "Failed to load nodes" });
  }
});

// GET /api/nodes/:address/score
router.get("/:address/score", async (req, res) => {
  try {
    const { address } = req.params;
    const contract = getContract();
    const metrics = await contract.nodeMetrics(address);
    const score = Number(await contract.calculateTrustScore(address));

    res.json({
      address,
      name: metrics.name,
      role: ROLE_NAMES[Number(metrics.role)],
      trustScore: score,
      cleanVerifications: Number(metrics.cleanVerifications),
      reportsFiledAgainst: Number(metrics.reportsFiledAgainst),
      isAlert: score < 70,
    });
  } catch (error) {
    res.status(404).json({ error: "Node not found or score unavailable" });
  }
});

module.exports = router;
