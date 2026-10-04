const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const HARDHAT_RPC_URL = process.env.HARDHAT_RPC_URL || "http://127.0.0.1:8545";
// cacheTimeout: -1 disables provider-level caching for instantaneous automined local transactions
const provider = new ethers.JsonRpcProvider(HARDHAT_RPC_URL, undefined, { cacheTimeout: -1 });

// Standard Hardhat mnemonic accounts private keys
const HARDHAT_ACCOUNTS = [
  { role: "manufacturer", name: "Apex Pharma Labs (Mfg)", roleId: 1, privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" },
  { role: "distributor", name: "NorthStar Logistics (Dist)", roleId: 2, privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" },
  { role: "wholesaler", name: "Metro Wholesale Drug Corp", roleId: 3, privateKey: "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a" },
  { role: "pharmacist", name: "St. Jude Community Pharmacy", roleId: 4, privateKey: "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6" },
  { role: "customer", name: "Demo Patient / End Consumer", roleId: 5, privateKey: "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a" },
];

function getContractConfig() {
  const configPath = path.join(__dirname, "contractConfig.json");
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (e) {
      console.error("Error reading contractConfig.json:", e);
    }
  }
  return null;
}

function getContract(signerOrProvider = provider) {
  const config = getContractConfig();
  if (!config || !config.address || !config.abi) {
    throw new Error("Contract is not yet deployed or contractConfig.json is missing. Please run 'npm run deploy:local' first.");
  }
  return new ethers.Contract(config.address, config.abi, signerOrProvider);
}

function getSignerForRole(roleName) {
  const account = HARDHAT_ACCOUNTS.find(
    (a) => a.role.toLowerCase() === roleName.toLowerCase()
  );
  if (!account) {
    throw new Error(`No account configured for role: ${roleName}`);
  }
  return new ethers.Wallet(account.privateKey, provider);
}

function getSignerByAddress(address) {
  const account = HARDHAT_ACCOUNTS.find(
    (a) => ethers.computeAddress(a.privateKey).toLowerCase() === address.toLowerCase()
  );
  if (!account) {
    return null;
  }
  return new ethers.Wallet(account.privateKey, provider);
}

module.exports = {
  provider,
  getContractConfig,
  getContract,
  getSignerForRole,
  getSignerByAddress,
  HARDHAT_ACCOUNTS: HARDHAT_ACCOUNTS.map(a => ({
    role: a.role,
    name: a.name,
    roleId: a.roleId,
    address: ethers.computeAddress(a.privateKey)
  }))
};
