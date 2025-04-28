import env, { ethers } from "hardhat";
import { ERC725 } from "@erc725/erc725.js";
import metadataJson from "../metadata/questMetadata.json";
import metadataQuestJson from "../metadata/questNftMetadata.json";
import dotenv from "dotenv";
import { ERC725YDataKeys } from "@lukso/lsp-smart-contracts";
import { LSP8DataKeys } from "@lukso/lsp8-contracts";
import { QuestBoard, QuestBoard__factory } from "../typechain-types";
import { Contract, JsonRpcProvider, toUtf8Bytes, Wallet } from "ethers";
import abi from "../artifacts/contracts/Questboard.sol/QuestBoard.json";

dotenv.config();

const provider = new ethers.JsonRpcProvider(
  "https://rpc.testnet.lukso.network",
  {
    chainId: 4201,
    name: "luksoTestnet",
  }
);

async function setData() {
  const BASE_URI = 'https://my-base-uri.com/nft/'
  const signer = new Wallet(process.env.PRIVATE_KEY!, provider);
  const nftContract = new Contract(
    "0x4AE76083d32F83eC3447ef5ef851ffC0Ca11EdB5",
    abi.abi,
    signer
  );

  const tx = await nftContract.setData(
    LSP8DataKeys.LSP8TokenMetadataBaseURI,
    toUtf8Bytes(BASE_URI)
  )

  const receipt = await tx.wait();

  console.log(receipt, 'receipt')
  console.log(BASE_URI, 'baseURI')
}

// Define the main function
async function main() {
  try {
    // Access the private key from the Hardhat variables
    const deployerPrivateKey = process.env.PRIVATE_KEY!;
    console.log("Deploying contract with account:", deployerPrivateKey);

    // Create a wallet instance using the private key and connect it to the provider
    const deployerWallet = new ethers.Wallet(deployerPrivateKey, provider);

    const nftCollection: QuestBoard = await new QuestBoard__factory(
      deployerWallet
    ).deploy("QuestBoard", "QST", deployerWallet.address, 1, 0);

    await nftCollection.waitForDeployment();

    const baseURIDataKey = ERC725YDataKeys.LSP8["LSP8TokenMetadataBaseURI"];

    const postObj = {
      verification: {
        method: "keccak256(bytes)",
        data: "0x",
      },
      url: "ipfs://bafybeigpyxphre5633tfroed745xriypxqizsjti5kkk2heaolkunjtqve/",
    };

    // // Set the base URI
    const tx = await nftCollection.setData(
      LSP8DataKeys.LSP8TokenMetadataBaseURI,
      toUtf8Bytes(
        "ipfs://bafybeid34vrq5hbudni74hfec47ff3nu32w2ccdu4rztih6pzwdgbhe5di/"
      )
    );

    await tx.wait();

    const result = await nftCollection.getData(baseURIDataKey);

    console.log(nftCollection);
    console.log("Base URI set to: ", result);
  } catch (error) {
    console.error("Error deploying contract:", error);
  }
}

async function setCollectionMetadata() {
  // private key
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // public key
  const universalProfileAddress = process.env.PUBLIC_KEY!;
  const ABI = [
    "function execute(uint256 operationType, address target, uint256 value, bytes calldata data) external returns (bytes)",
  ];

  const universalProfile = new ethers.Contract(
    universalProfileAddress,
    ABI,
    wallet
  );

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
        url: "ipfs://bafkreietyjbhgpw4xvvvxgc32etgyuxzhdizmolfyv223e74imsp2smxda",
      },
    },
  ]);

  // Encode the setData function call
  const setDataInterface = new ethers.Interface([
    "function setData(bytes32 key, bytes value) external",
  ]);
  const setDataData = setDataInterface.encodeFunctionData("setData", [
    encodedData.keys[0],
    encodedData.values[0],
  ]);

  // Call execute on the Universal Profile1
  const tx = await universalProfile.execute(
    0, // CALL operation
    process.env.CONTRACT_ADDRESS!, // target contract
    0, // value (0 ETH)
    setDataData // encoded setData call
  );
}

export async function setTokenIdMetadata() {
  const provider = new ethers.JsonRpcProvider(
    "https://rpc.testnet.lukso.network",
    {
      chainId: 4201,
      name: "luksoTestnet",
    }
  );
  const wallet = new ethers.Wallet(
    "0x43361a4e65f999bb2fe735d873f393763a931121a4f4ee4d775e8a3cd228a34a",
    provider
  );

  const universalProfileAddress = "0x61d397d2c872F521c0A0BCD13d1cb31ec2c8Bc05";
  const ABI = [
    "function execute(uint256 operationType, address target, uint256 value, bytes calldata data) external returns (bytes)",
  ];

  const universalProfile = new ethers.Contract(
    universalProfileAddress,
    ABI,
    wallet
  );

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
        json: JSON.stringify(metadataQuestJson),
        url: "ipfs://QmQGyJQwBXgxCw5cbxVaJjmTQNvB4JxyM1gYCmA5fDkX3Y",
      },
    },
  ]);

  // Encode the setData function call
  const setDataInterface = new ethers.Interface([
    "function setDataForTokenId(bytes32 tokenId, bytes32 key, bytes value) external",
  ]);

  const newTokenId = ethers.zeroPadValue(ethers.toBeHex(3), 32);

  const setDataData = setDataInterface.encodeFunctionData("setDataForTokenId", [
    newTokenId,
    encodedData.keys[0],
    encodedData.values[0],
  ]);

  // Call execute on the Universal Profile
  const tx = await universalProfile.execute(
    0, // CALL operation
    process.env.CONTRACT_ADDRESS!, // target contract
    0, // value (0 ETH)
    setDataData // encoded setData call
  );
  await tx.wait();
}

// Call the main function
setData().catch((error) => {
  console.error("Error in the deployment process:", error);
  process.exitCode = 1;
});
