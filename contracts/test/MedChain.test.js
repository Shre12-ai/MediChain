const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedChain Smart Contract Tests", function () {
  let medChain;
  let owner, manufacturer, distributor, wholesaler, pharmacist, customer, unauthorized;

  const BATCH_NUM = "MED-2026-001";
  const MEDICINE_NAME = "Amoxicillin 500mg";
  const NOW = Math.floor(Date.now() / 1000);
  const MFG_DATE = NOW - 3600 * 24 * 30; // 30 days ago
  const EXP_DATE = NOW + 3600 * 24 * 365; // 1 year ahead

  beforeEach(async function () {
    [owner, manufacturer, distributor, wholesaler, pharmacist, customer, unauthorized] = await ethers.getSigners();

    const MedChain = await ethers.getContractFactory("MedChain");
    medChain = await MedChain.deploy();
    await medChain.waitForDeployment();

    // Assign roles
    await medChain.assignRole(manufacturer.address, 1, "Manufacturer A");
    await medChain.assignRole(distributor.address, 2, "Distributor B");
    await medChain.assignRole(wholesaler.address, 3, "Wholesaler C");
    await medChain.assignRole(pharmacist.address, 4, "Pharmacist D");
    await medChain.assignRole(customer.address, 5, "Customer E");
  });

  describe("Role-Based Batch Registration", function () {
    it("Allows registered Manufacturer to register a batch", async function () {
      await expect(
        medChain.connect(manufacturer).registerBatch(BATCH_NUM, MEDICINE_NAME, MFG_DATE, EXP_DATE)
      )
        .to.emit(medChain, "BatchRegistered")
        .withArgs(BATCH_NUM, await medChain.computeBatchHash(BATCH_NUM, MFG_DATE, EXP_DATE), manufacturer.address, MFG_DATE, EXP_DATE);

      const batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.batchNumber).to.equal(BATCH_NUM);
      expect(batch.currentCustodian).to.equal(manufacturer.address);
      expect(batch.status).to.equal(0); // Genuine
      expect(batch.isFinalized).to.be.false;
    });

    it("Rejects registration by non-manufacturer accounts", async function () {
      await expect(
        medChain.connect(distributor).registerBatch("FAIL-01", "Drug", MFG_DATE, EXP_DATE)
      ).to.be.revertedWith("Only Manufacturer can register a batch");

      await expect(
        medChain.connect(unauthorized).registerBatch("FAIL-02", "Drug", MFG_DATE, EXP_DATE)
      ).to.be.revertedWith("Only Manufacturer can register a batch");
    });

    it("Rejects duplicate batch numbers", async function () {
      await medChain.connect(manufacturer).registerBatch(BATCH_NUM, MEDICINE_NAME, MFG_DATE, EXP_DATE);
      await expect(
        medChain.connect(manufacturer).registerBatch(BATCH_NUM, MEDICINE_NAME, MFG_DATE, EXP_DATE)
      ).to.be.revertedWith("Batch number already exists on-chain");
    });
  });

  describe("Strict Sequential Custody Transfers", function () {
    beforeEach(async function () {
      await medChain.connect(manufacturer).registerBatch(BATCH_NUM, MEDICINE_NAME, MFG_DATE, EXP_DATE);
    });

    it("Allows valid sequential handoff: Mfg -> Dist -> Wholesaler -> Pharmacy -> Customer", async function () {
      // 1. Mfg -> Dist
      await expect(
        medChain.connect(manufacturer).transferCustody(BATCH_NUM, distributor.address, "Handoff to cold storage transport")
      ).to.emit(medChain, "CustodyTransferred");

      let batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.currentCustodian).to.equal(distributor.address);

      // 2. Dist -> Wholesaler
      await medChain.connect(distributor).transferCustody(BATCH_NUM, wholesaler.address, "Delivered to regional warehouse");
      batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.currentCustodian).to.equal(wholesaler.address);

      // 3. Wholesaler -> Pharmacist
      await medChain.connect(wholesaler).transferCustody(BATCH_NUM, pharmacist.address, "Supplied to local clinic pharmacy");
      batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.currentCustodian).to.equal(pharmacist.address);

      // 4. Pharmacist -> Customer
      await medChain.connect(pharmacist).transferCustody(BATCH_NUM, customer.address, "Dispensed on prescription");
      batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.currentCustodian).to.equal(customer.address);
      expect(batch.isFinalized).to.be.true;

      const trail = await medChain.getCustodyTrail(BATCH_NUM);
      expect(trail.length).to.equal(5); // 1 genesis + 4 transfers
    });

    it("Rejects out-of-order handoffs (e.g. Mfg skipping Distributor directly to Wholesaler)", async function () {
      await expect(
        medChain.connect(manufacturer).transferCustody(BATCH_NUM, wholesaler.address, "Skip distributor")
      ).to.be.revertedWith("Manufacturer must hand off to Distributor");
    });

    it("Rejects custody transfer by a party that is not current custodian", async function () {
      await expect(
        medChain.connect(distributor).transferCustody(BATCH_NUM, wholesaler.address, "Unauthorized")
      ).to.be.revertedWith("Caller is not current recorded custodian");
    });
  });

  describe("Batch Verification & Flagging", function () {
    beforeEach(async function () {
      await medChain.connect(manufacturer).registerBatch(BATCH_NUM, MEDICINE_NAME, MFG_DATE, EXP_DATE);
    });

    it("Successfully verifies an authentic batch and increments scan count", async function () {
      const tx = await medChain.connect(customer).verifyBatch(BATCH_NUM);
      await tx.wait();

      const batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.scanCount).to.equal(1);
      expect(batch.status).to.equal(0); // Genuine
    });

    it("Flags batch if duplicate scan happens after customer finalization", async function () {
      // Progress to customer
      await medChain.connect(manufacturer).transferCustody(BATCH_NUM, distributor.address, "To dist");
      await medChain.connect(distributor).transferCustody(BATCH_NUM, wholesaler.address, "To whole");
      await medChain.connect(wholesaler).transferCustody(BATCH_NUM, pharmacist.address, "To pharm");
      await medChain.connect(pharmacist).transferCustody(BATCH_NUM, customer.address, "Dispensed");

      // First customer scan
      await medChain.connect(customer).verifyBatch(BATCH_NUM);
      let batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.status).to.equal(0); // Genuine

      // Second duplicate scan triggers flag
      await expect(medChain.connect(customer).verifyBatch(BATCH_NUM))
        .to.emit(medChain, "BatchFlagged")
        .withArgs(BATCH_NUM, "Duplicate scan alert", customer.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));

      batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.status).to.equal(1); // Flagged
    });
  });

  describe("Crowdsourced Reporting & Dynamic Trust Scoring", function () {
    beforeEach(async function () {
      await medChain.connect(manufacturer).registerBatch(BATCH_NUM, MEDICINE_NAME, MFG_DATE, EXP_DATE);
      await medChain.connect(manufacturer).transferCustody(BATCH_NUM, distributor.address, "To dist");
    });

    it("Allows customer/pharmacist to report suspicious batch, decreasing custodian trust score", async function () {
      const initialScore = await medChain.calculateTrustScore(distributor.address);
      expect(initialScore).to.equal(100);

      // Customer reports suspicious packaging
      await expect(
        medChain.connect(customer).reportSuspiciousBatch(BATCH_NUM, "Tampered seal detected")
      ).to.emit(medChain, "ReportFiled");

      const batch = await medChain.getBatch(BATCH_NUM);
      expect(batch.status).to.equal(1); // Flagged
      expect(batch.reportCount).to.equal(1);

      // Verify distributor score dropped
      const updatedScore = await medChain.calculateTrustScore(distributor.address);
      expect(updatedScore).to.be.lessThan(100);
    });
  });
});
