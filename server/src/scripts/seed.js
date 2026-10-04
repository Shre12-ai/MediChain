const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const { ethers } = require("ethers");
const QRCode = require("qrcode");
const { connectDB } = require("../config/db");
const { provider, getContract, getSignerForRole, HARDHAT_ACCOUNTS } = require("../config/blockchain");
const BatchService = require("../models/Batch");
const NodeProfileService = require("../models/NodeProfile");
const ReportService = require("../models/Report");
const UserService = require("../models/User");

async function sendTx(contractWithSigner, methodName, ...args) {
  const signer = contractWithSigner.runner;
  const nonceHex = await provider.send("eth_getTransactionCount", [signer.address, "latest"]);
  const nonce = parseInt(nonceHex, 16);
  const tx = await contractWithSigner[methodName](...args, { nonce });
  return await tx.wait(1);
}

async function seed() {
  console.log("--------------------------------------------------");
  console.log(" Starting MedChain End-to-End Demo Seeder...");
  console.log("--------------------------------------------------");

  await connectDB();

  // Signers for each role
  const manufacturerSigner = getSignerForRole("manufacturer");
  const distributorSigner = getSignerForRole("distributor");
  const wholesalerSigner = getSignerForRole("wholesaler");
  const pharmacistSigner = getSignerForRole("pharmacist");
  const customerSigner = getSignerForRole("customer");

  const mfgContract = getContract(manufacturerSigner);
  const distContract = getContract(distributorSigner);
  const wholeContract = getContract(wholesalerSigner);
  const pharmContract = getContract(pharmacistSigner);
  const custContract = getContract(customerSigner);

  // 1. Seed Node Profiles
  console.log("\n1. Seeding Node Profiles...");
  for (const acc of HARDHAT_ACCOUNTS) {
    await NodeProfileService.upsert(acc.address, {
      name: acc.name,
      role: acc.role,
      roleId: acc.roleId,
      facilityLocation: "Sector 4 Industrial Hub, Delhi NCR",
      contactEmail: `${acc.role}@medchain-demo.org`,
    });
  }
  console.log("✓ Node profiles seeded.");

  const now = Math.floor(Date.now() / 1000);

  // 2. Batch 1: Genuine In-Transit Batch (Amoxicillin 500mg)
  // Reached Pharmacist, ready for patient verification
  const b1Number = "MED-2026-001";
  const b1Mfg = now - 3600 * 24 * 15; // 15 days ago
  const b1Exp = now + 3600 * 24 * 365; // 1 year ahead
  console.log(`\n2. Registering and handoff chain for ${b1Number}...`);

  try {
    await sendTx(mfgContract, "registerBatch", b1Number, "Amoxicillin 500mg", b1Mfg, b1Exp);

    // Handoff 1: Mfg -> Dist
    await sendTx(mfgContract, "transferCustody", b1Number, distributorSigner.address, "Dispatched in monitored cold chain container");

    // Handoff 2: Dist -> Wholesaler
    await sendTx(distContract, "transferCustody", b1Number, wholesalerSigner.address, "Received at Central Depot and verified seals");

    // Handoff 3: Wholesaler -> Pharmacist
    await sendTx(wholeContract, "transferCustody", b1Number, pharmacistSigner.address, "Delivered to St. Jude Pharmacy store");

    const b1Hash = await mfgContract.computeBatchHash(b1Number, b1Mfg, b1Exp);
    const b1Qr = await QRCode.toDataURL(JSON.stringify({ medchain: true, batchNumber: b1Number, hash: b1Hash }), {
      margin: 2,
      color: { dark: "#1B3B22", light: "#F4F1EA" }
    });

    await BatchService.create({
      batchNumber: b1Number,
      medicineName: "Amoxicillin 500mg",
      composition: "Amoxicillin Trihydrate IP 500mg",
      dosage: "500mg Capsules",
      manufacturerName: "Apex Pharma Labs (Mfg)",
      mfgDate: new Date(b1Mfg * 1000),
      expDate: new Date(b1Exp * 1000),
      storageTemperature: "20°C - 25°C",
      packageType: "Strip of 10 Capsules",
      qrCodeDataUrl: b1Qr,
      notes: "High demand broad-spectrum antibiotic batch.",
    });
    console.log(`✓ ${b1Number} transferred to Pharmacist.`);
  } catch (e) {
    console.log(`Batch ${b1Number} handling:`, e.reason || e.message);
  }

  // 3. Batch 2: Fully Dispensed & Verified Genuine Batch (Paracetamol 650mg)
  const b2Number = "MED-2026-002";
  const b2Mfg = now - 3600 * 24 * 45;
  const b2Exp = now + 3600 * 24 * 500;
  console.log(`\n3. Registering and full lifecycle for ${b2Number}...`);

  try {
    await sendTx(mfgContract, "registerBatch", b2Number, "Paracetamol 650mg", b2Mfg, b2Exp);
    await sendTx(mfgContract, "transferCustody", b2Number, distributorSigner.address, "Batch handed over to freight");
    await sendTx(distContract, "transferCustody", b2Number, wholesalerSigner.address, "Warehouse intake accepted");
    await sendTx(wholeContract, "transferCustody", b2Number, pharmacistSigner.address, "Shipped to local chemist");

    // Dispense to Customer
    await sendTx(pharmContract, "transferCustody", b2Number, customerSigner.address, "Dispensed over counter with valid prescription");

    // Customer scans and verifies on-chain
    await sendTx(custContract, "verifyBatch", b2Number);

    const b2Hash = await mfgContract.computeBatchHash(b2Number, b2Mfg, b2Exp);
    const b2Qr = await QRCode.toDataURL(JSON.stringify({ medchain: true, batchNumber: b2Number, hash: b2Hash }), {
      margin: 2,
      color: { dark: "#1B3B22", light: "#F4F1EA" }
    });

    await BatchService.create({
      batchNumber: b2Number,
      medicineName: "Paracetamol 650mg",
      composition: "Paracetamol IP 650mg",
      dosage: "650mg Tablet",
      manufacturerName: "Apex Pharma Labs (Mfg)",
      mfgDate: new Date(b2Mfg * 1000),
      expDate: new Date(b2Exp * 1000),
      storageTemperature: "Room Temperature",
      packageType: "Blister Pack (15 Tablets)",
      qrCodeDataUrl: b2Qr,
      notes: "Fast relief antipyretic & analgesic.",
    });
    console.log(`✓ ${b2Number} completed full chain and clean verification.`);
  } catch (e) {
    console.log(`Batch ${b2Number} handling:`, e.reason || e.message);
  }

  // 4. Batch 3: Suspicious / Flagged Batch (Azithromycin 250mg)
  // Demonstrates Crowdsourced Reporting & Trust Score Alert
  const b3Number = "MED-2026-003";
  const b3Mfg = now - 3600 * 24 * 10;
  const b3Exp = now + 3600 * 24 * 300;
  console.log(`\n4. Registering and reporting suspicious batch ${b3Number}...`);

  try {
    await sendTx(mfgContract, "registerBatch", b3Number, "Azithromycin 250mg", b3Mfg, b3Exp);
    await sendTx(mfgContract, "transferCustody", b3Number, distributorSigner.address, "Transferred to distributor hub");

    // Customer / Pharmacist files suspicious report against current custody holder
    await sendTx(custContract, "reportSuspiciousBatch", b3Number, "Broken hologram seal and blurry batch expiration print");

    const b3Hash = await mfgContract.computeBatchHash(b3Number, b3Mfg, b3Exp);
    const b3Qr = await QRCode.toDataURL(JSON.stringify({ medchain: true, batchNumber: b3Number, hash: b3Hash }), {
      margin: 2,
      color: { dark: "#8A2C20", light: "#F4F1EA" } // Rust ink for flagged
    });

    await BatchService.create({
      batchNumber: b3Number,
      medicineName: "Azithromycin 250mg",
      composition: "Azithromycin Dihydrate IP 250mg",
      dosage: "250mg Tablet",
      manufacturerName: "Apex Pharma Labs (Mfg)",
      mfgDate: new Date(b3Mfg * 1000),
      expDate: new Date(b3Exp * 1000),
      storageTemperature: "Below 30°C",
      packageType: "Strip of 6 Tablets",
      qrCodeDataUrl: b3Qr,
      notes: "Flagged on-chain due to suspicious tamper indicators.",
    });

    await ReportService.create({
      batchNumber: b3Number,
      reporterAddress: customerSigner.address,
      reporterRole: "Customer",
      attributedNode: distributorSigner.address,
      reason: "Broken hologram seal and blurry batch expiration print",
      location: "Pharmacy counter check",
    });
    console.log(`✓ ${b3Number} successfully flagged and reported on-chain.`);
  } catch (e) {
    console.log(`Batch ${b3Number} error:`, e.reason || e.message);
  }

  // 5. Seed Demo User Registration Requests
  console.log("\n5. Seeding Demo User Access Requests...");
  try {
    const demoUsers = [
      {
        name: "Dr. Neha Sharma",
        email: "neha@stjude-pharma.org",
        wallet_address: "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        role: "pharmacist",
        facility_name: "St. Jude Community Pharmacy",
        license_number: "DL-PH-88992",
        contact_phone: "+91-98765-11223",
        reason_for_access: "Licensed dispensing pharmacist verifying medicine batches for patients.",
        status: "approved",
      },
      {
        name: "Vikram Malhotra",
        email: "vikram@bluedart-med.com",
        wallet_address: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
        role: "distributor",
        facility_name: "BlueDart Cold-Chain Logistics",
        license_number: "DL-DIST-44221",
        contact_phone: "+91-98112-33445",
        reason_for_access: "Cold-chain temperature-controlled pharmaceutical transport operator.",
        status: "pending",
      },
      {
        name: "Suresh Gupta",
        email: "suresh@central-wholesale.in",
        wallet_address: "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f",
        role: "wholesaler",
        facility_name: "Central Region Drug Wholesale Depot",
        license_number: "DL-WS-55112",
        contact_phone: "+91-99881-22334",
        reason_for_access: "Authorized bulk drug distribution hub supplying 120+ retail pharmacies.",
        status: "pending",
      }
    ];

    for (const u of demoUsers) {
      await UserService.create(u);
    }
    console.log("✓ Demo user access requests seeded (1 Approved, 2 Pending review).");
  } catch (e) {
    console.log("User access seed note:", e.message);
  }

  console.log("\n==================================================");
  console.log(" MedChain Demo Seeding Completed Successfully!");
  console.log("==================================================");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
