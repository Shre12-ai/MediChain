const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { getContractConfig, HARDHAT_ACCOUNTS } = require("./config/blockchain");

const batchRoutes = require("./routes/batches");
const nodeRoutes = require("./routes/nodes");
const reportRoutes = require("./routes/reports");
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/batches", batchRoutes);
app.use("/api/nodes", nodeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Health and Status route
app.get("/api/status", (req, res) => {
  const contractConfig = getContractConfig();
  res.json({
    status: "ok",
    service: "MedChain REST API",
    contractDeployed: !!contractConfig,
    contractAddress: contractConfig ? contractConfig.address : null,
    chainId: contractConfig ? contractConfig.chainId : null,
    demoAccounts: HARDHAT_ACCOUNTS,
    timestamp: new Date().toISOString(),
  });
});

// Root ping
app.get("/", (req, res) => {
  res.send("MedChain API Server is active. See /api/status for deployment details.");
});

// Boot server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(` MedChain API Server running on port ${PORT}`);
    console.log(` Endpoint: http://localhost:${PORT}`);
    console.log(`=========================================`);
  });
}

startServer();
