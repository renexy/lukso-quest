import { ethers } from "hardhat";
import { ERC725 } from "@erc725/erc725.js";
import metadataJson from "../metadata/questMetadata.json";
import dotenv from "dotenv";
import { QuestBoard, QuestBoard__factory } from "../typechain-types";

dotenv.config();

// testnet
const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lukso.network",
  {
    chainId: 4201,
    name: "luksoTestnet",
  }
);

// const provider = new ethers.JsonRpcProvider(
//   "https://42.rpc.thirdweb.com",
//   {
//     chainId: 42,
//     name: "luksoMainnet",
//   }
// );
async function main() {
  try {
    const deployerPrivateKey = "0x43361a4e65f999bb2fe735d873f393763a931121a4f4ee4d775e8a3cd228a34a";

    const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider);

    const schema = [
      {
        name: "LSP4Metadata",
        key: "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
        keyType: "Singleton",
        valueType: "bytes",
        valueContent: "VerifiableURI",
      },
    ];
    const erc725 = new ERC725(schema) as any;
    const encodedData = erc725.encodeData([
      {
        keyName: "LSP4Metadata",
        value: {
          json: JSON.stringify(metadataJson),
          url: "ipfs://bafkreihrot6eixd4ammpmrt77djjvm6kohku2mm7ml6wh2rbih3aoyvrla",
        },
      },
    ]);

    console.log(encodedData, 'lol')

    const nftCollection: QuestBoard = await new QuestBoard__factory(
      deployerWallet
    ).deploy("QuestBoard", "QST", deployerWallet.address, 1, 0, encodedData.values[0]);

    await nftCollection.waitForDeployment();

    console.log(nftCollection);
  } catch (error) {
    console.error("Error deploying contract:", error);
  }
}

// Call the main function
main().catch((error) => {
  console.error("Error in the deployment process:", error);
  process.exitCode = 1;
});
