const express = require("express");
const router = express.Router();
const { getContract, getSignerForRole } = require("../config/blockchain");
const ReportService = require("../models/Report");

// POST /api/reports - Submit suspicious batch report
router.post("/", async (req, res) => {
  try {
    const { batchNumber, reason, reporterRole, location } = req.body;
    if (!batchNumber || !reason) {
      return res.status(400).json({ error: "batchNumber and reason are required" });
    }

    // Connect as reporter (default to customer or pharmacist)
    const roleToUse = (reporterRole && reporterRole.toLowerCase() === "pharmacist") ? "pharmacist" : "customer";
    const reporterSigner = getSignerForRole(roleToUse);
    const contract = getContract(reporterSigner);

    console.log(`Filing suspicious report for batch ${batchNumber} by ${reporterSigner.address}...`);
    const tx = await contract.reportSuspiciousBatch(batchNumber, reason);
    const receipt = await tx.wait();

    // Get current batch info to identify attributed node
    const rawBatch = await contract.getBatch(batchNumber);
    const attributedNode = rawBatch[6]; // currentCustodian or last node

    const reportDoc = await ReportService.create({
      batchNumber,
      reporterAddress: reporterSigner.address,
      reporterRole: roleToUse,
      attributedNode,
      reason,
      location: location || "Local Clinic / User App",
      txHash: receipt.hash,
    });

    res.status(201).json({
      message: "Suspicious batch report registered on-chain and logged",
      report: reportDoc,
      txHash: receipt.hash,
    });
  } catch (error) {
    console.error("Report error:", error);
    res.status(500).json({ error: error.reason || error.message || "Failed to submit report" });
  }
});

// GET /api/reports/:batchNumber - Get reports for a batch
router.get("/:batchNumber", async (req, res) => {
  try {
    const reports = await ReportService.find({ batchNumber: req.params.batchNumber });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
