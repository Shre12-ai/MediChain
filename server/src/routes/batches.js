const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const { getContract, getSignerForRole, getSignerByAddress, HARDHAT_ACCOUNTS } = require("../config/blockchain");
const BatchService = require("../models/Batch");
const NodeProfileService = require("../models/NodeProfile");

const ROLE_NAMES = ["None", "Manufacturer", "Distributor", "Wholesaler", "Pharmacist", "Customer"];
const STATUS_NAMES = ["Genuine", "Flagged", "Expired"];

// 1. Register Batch
router.post("/register", async (req, res) => {
  try {
    const {
      batchNumber,
      medicineName,
      composition,
      dosage,
      mfgDate,
      expDate,
      storageTemperature,
      packageType,
      notes,
    } = req.body;

    if (!batchNumber || !medicineName || !mfgDate || !expDate) {
      return res.status(400).json({ error: "Missing required fields (batchNumber, medicineName, mfgDate, expDate)" });
    }

    const mfgTimestamp = Math.floor(new Date(mfgDate).getTime() / 1000);
    const expTimestamp = Math.floor(new Date(expDate).getTime() / 1000);

    if (expTimestamp <= mfgTimestamp) {
      return res.status(400).json({ error: "Expiry date must be after manufacturing date" });
    }

    // Connect manufacturer signer
    const manufacturerSigner = getSignerForRole("manufacturer");
    const contract = getContract(manufacturerSigner);

    // Call on-chain registerBatch
    console.log(`Submitting on-chain registration for batch ${batchNumber}...`);
    const tx = await contract.registerBatch(batchNumber, medicineName, mfgTimestamp, expTimestamp);
    const receipt = await tx.wait();

    // Compute expected hash on-chain
    const batchHash = await contract.computeBatchHash(batchNumber, mfgTimestamp, expTimestamp);

    // Generate QR code encoding batch verification payload
    const qrPayload = JSON.stringify({
      medchain: true,
      batchNumber,
      medicineName,
      mfgDate,
      expDate,
      hash: batchHash,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      color: {
        dark: "#1B3B22", // Deep green ink color matching design
        light: "#F4F1EA", // Sage paper background
      },
    });

    // Save extended metadata to MongoDB / memory
    const batchDoc = await BatchService.create({
      batchNumber,
      medicineName,
      composition: composition || "Active Pharmaceutical Ingredient",
      dosage: dosage || "500mg",
      manufacturerName: "Apex Pharma Labs (Mfg)",
      mfgDate: new Date(mfgDate),
      expDate: new Date(expDate),
      storageTemperature: storageTemperature || "15°C - 25°C",
      packageType: packageType || "Blister Pack (10x10)",
      qrCodeDataUrl,
      notes,
    });

    res.status(201).json({
      message: "Batch registered and anchored on-chain successfully",
      batch: batchDoc,
      onChain: {
        batchHash,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        currentCustodian: await manufacturerSigner.getAddress(),
        currentRole: "Manufacturer",
      },
    });
  } catch (error) {
    console.error("Batch registration error:", error);
    res.status(500).json({ error: error.reason || error.message || "Failed to register batch" });
  }
});

// 2. Custody Transfer
router.post("/transfer", async (req, res) => {
  try {
    const { batchNumber, toAddress, notes, fromRole } = req.body;
    if (!batchNumber || !toAddress) {
      return res.status(400).json({ error: "batchNumber and toAddress are required" });
    }

    // Determine signer: either by specified fromRole or check who is current custodian
    const readContract = getContract();
    const batchOnChain = await readContract.getBatch(batchNumber);
    const currentCustodian = batchOnChain[6]; // address currentCustodian

    let signer = getSignerByAddress(currentCustodian);
    if (!signer && fromRole) {
      signer = getSignerForRole(fromRole);
    }
    if (!signer) {
      return res.status(400).json({ error: `Cannot resolve signer for current custodian: ${currentCustodian}` });
    }

    const contractWithSigner = getContract(signer);
    console.log(`Transferring custody of ${batchNumber} from ${signer.address} to ${toAddress}...`);
    const tx = await contractWithSigner.transferCustody(batchNumber, toAddress, notes || "Custody transferred");
    const receipt = await tx.wait();

    res.json({
      message: "Custody transfer confirmed on-chain",
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: signer.address,
      to: toAddress,
    });
  } catch (error) {
    console.error("Custody transfer error:", error);
    res.status(500).json({ error: error.reason || error.message || "Failed to transfer custody" });
  }
});

// 3. Verify Batch
router.get("/verify/:batchNumber", async (req, res) => {
  try {
    const { batchNumber } = req.params;
    const contract = getContract();

    // Call verifyBatch on-chain (using customer signer so state/scanCount updates)
    const customerSigner = getSignerForRole("customer");
    const contractWithSigner = getContract(customerSigner);

    let verifyTx = await contractWithSigner.verifyBatch(batchNumber);
    let receipt = await verifyTx.wait();

    // Read full details from contract
    const rawBatch = await contract.getBatch(batchNumber);
    const rawTrail = await contract.getCustodyTrail(batchNumber);
    const rawReports = await contract.getBatchReports(batchNumber);

    const onChainBatch = {
      batchNumber: rawBatch.batchNumber || rawBatch[0],
      medicineName: rawBatch.medicineName || rawBatch[1],
      mfgDate: Number(rawBatch.mfgDate ?? rawBatch[2]) * 1000,
      expDate: Number(rawBatch.expDate ?? rawBatch[3]) * 1000,
      batchHash: rawBatch.batchHash || rawBatch[4],
      manufacturer: rawBatch.manufacturer || rawBatch[5],
      currentCustodian: rawBatch.currentCustodian || rawBatch[6],
      currentRole: ROLE_NAMES[Number(rawBatch.currentRole ?? rawBatch[7])] || "Unknown",
      status: STATUS_NAMES[Number(rawBatch.status ?? rawBatch[8])] || "Unknown",
      isFinalized: Boolean(rawBatch.isFinalized ?? rawBatch[9]),
      scanCount: Number(rawBatch.scanCount ?? rawBatch[10]),
      reportCount: Number(rawBatch.reportCount ?? rawBatch[11]),
      createdAt: Number(rawBatch.createdAt ?? rawBatch[12]) * 1000,
    };

    const custodyTrail = rawTrail.map((record) => ({
      from: record[0],
      to: record[1],
      fromRole: ROLE_NAMES[Number(record[2])] || "Genesis",
      toRole: ROLE_NAMES[Number(record[3])] || "Unknown",
      timestamp: Number(record[4]) * 1000,
      notes: record[5],
    }));

    const reports = rawReports.map((rep) => ({
      batchNumber: rep[0],
      reporter: rep[1],
      attributedNode: rep[2],
      reporterRole: ROLE_NAMES[Number(rep[3])] || "Reporter",
      reason: rep[4],
      timestamp: Number(rep[5]) * 1000,
    }));

    // Fetch off-chain metadata
    const offChain = await BatchService.findOne({ batchNumber });

    // Determine verdict
    let verdict = "GENUINE";
    if (onChainBatch.status === "Flagged") {
      verdict = "FLAGGED";
    } else if (onChainBatch.status === "Expired" || Date.now() > onChainBatch.expDate) {
      verdict = "EXPIRED";
    }

    res.json({
      verdict,
      onChain: onChainBatch,
      custodyTrail,
      reports,
      metadata: offChain || {},
      verificationTx: receipt.hash,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(404).json({ error: error.reason || error.message || "Batch not found on-chain" });
  }
});

// 4. List All Batches
router.get("/", async (req, res) => {
  try {
    const contract = getContract();
    const batchNumbers = await contract.getAllBatches();

    const batchesList = await Promise.all(
      batchNumbers.map(async (num) => {
        try {
          const raw = await contract.getBatch(num);
          const meta = await BatchService.findOne({ batchNumber: num });
          return {
            batchNumber: raw[0],
            medicineName: raw[1],
            mfgDate: Number(raw[2]) * 1000,
            expDate: Number(raw[3]) * 1000,
            batchHash: raw[4],
            currentCustodian: raw[6],
            currentRole: ROLE_NAMES[Number(raw[7])] || "Unknown",
            status: STATUS_NAMES[Number(raw[8])] || "Unknown",
            isFinalized: raw[9],
            scanCount: Number(raw[10]),
            reportCount: Number(raw[11]),
            metadata: meta || null,
          };
        } catch (e) {
          return null;
        }
      })
    );

    res.json({ batches: batchesList.filter(Boolean) });
  } catch (error) {
    console.error("List batches error:", error);
    res.status(500).json({ error: error.message || "Failed to load batches" });
  }
});

module.exports = router;
