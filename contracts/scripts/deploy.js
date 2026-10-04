const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting MedChain contract deployment on network:", hre.network.name);

  const [deployer, distributor, wholesaler, pharmacist, customer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const MedChain = await hre.ethers.getContractFactory("MedChain");
  const medChain = await MedChain.deploy();
  await medChain.waitForDeployment();

  const contractAddress = await medChain.getAddress();
  console.log("MedChain deployed to:", contractAddress);

  // Set up standard demo roles
  // Roles: 1 = Manufacturer, 2 = Distributor, 3 = Wholesaler, 4 = Pharmacist, 5 = Customer
  console.log("Configuring demo supply-chain participants...");
  await medChain.assignRole(deployer.address, 1, "Apex Pharma Labs (Mfg)");
  await medChain.assignRole(distributor.address, 2, "NorthStar Logistics (Dist)");
  await medChain.assignRole(wholesaler.address, 3, "Metro Wholesale Drug Corp");
  await medChain.assignRole(pharmacist.address, 4, "St. Jude Community Pharmacy");
  await medChain.assignRole(customer.address, 5, "Demo Patient / End Consumer");

  console.log("Roles assigned successfully:");
  console.log(" - Manufacturer:", deployer.address);
  console.log(" - Distributor: ", distributor.address);
  console.log(" - Wholesaler:  ", wholesaler.address);
  console.log(" - Pharmacist:  ", pharmacist.address);
  console.log(" - Customer:    ", customer.address);

  // Read Artifact ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/MedChain.sol/MedChain.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  const configData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    roles: {
      manufacturer: { address: deployer.address, name: "Apex Pharma Labs (Mfg)", roleId: 1 },
      distributor: { address: distributor.address, name: "NorthStar Logistics (Dist)", roleId: 2 },
      wholesaler: { address: wholesaler.address, name: "Metro Wholesale Drug Corp", roleId: 3 },
      pharmacist: { address: pharmacist.address, name: "St. Jude Community Pharmacy", roleId: 4 },
      customer: { address: customer.address, name: "Demo Patient / End Consumer", roleId: 5 },
    },
    abi: artifact.abi,
  };

  // Sync to server config
  const serverConfigDir = path.join(__dirname, "../../server/src/config");
  if (!fs.existsSync(serverConfigDir)) {
    fs.mkdirSync(serverConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(serverConfigDir, "contractConfig.json"),
    JSON.stringify(configData, null, 2)
  );
  console.log("Exported contract config to server/src/config/contractConfig.json");

  // Sync to client config
  const clientConfigDir = path.join(__dirname, "../../client/src/config");
  if (!fs.existsSync(clientConfigDir)) {
    fs.mkdirSync(clientConfigDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(clientConfigDir, "contractConfig.json"),
    JSON.stringify(configData, null, 2)
  );
  console.log("Exported contract config to client/src/config/contractConfig.json");

  console.log("Deployment and sync complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
