import { ethers, hre } from "hardhat";
import { vars } from "hardhat/config";

// Define the main function
async function main() {
  try {
    // Access the private key from the Hardhat variables
    const deployerPrivateKey = vars.get('DEPLOYER_PRIVATE_KEY');
    console.log("Deploying contract with account:", deployerPrivateKey);

    // Create a wallet instance using the private key and connect it to the provider
    const deployerWallet = new ethers.Wallet(deployerPrivateKey, ethers.provider);

    // Load the contract artifact (make sure to compile your contract first)
    const ContractFactory = await ethers.getContractFactory("Lock", deployerWallet);

    console.log("Deploying the contract...");

    // Deploy the contract using the deployer's wallet
    const contract = await ContractFactory.deploy();
    console.log("Contract deployed, waiting for confirmation...");

    // Log the contract's address
    console.log("Contract deployed at:", contract);

  } catch (error) {
    console.error("Error deploying contract:", error);
  }
}

// Call the main function
main().catch((error) => {
  console.error("Error in the deployment process:", error);
  process.exitCode = 1;
});
