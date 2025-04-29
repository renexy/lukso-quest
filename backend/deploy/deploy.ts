import env, { ethers } from "hardhat";
import { encodeData, ERC725 } from "@erc725/erc725.js";
import metadataJson from "../metadata/questMetadata.json";
import metadataQuestJson from "../metadata/questNftMetadata.json";
import dotenv from "dotenv";
import { ERC725YDataKeys } from "@lukso/lsp-smart-contracts";
import { LSP8DataKeys } from "@lukso/lsp8-contracts";
import { QuestBoard, QuestBoard__factory } from "../typechain-types";
import { Contract, JsonRpcProvider, toBeHex, toUtf8Bytes, Wallet } from "ethers";
import abi from "../artifacts/contracts/Questboard.sol/QuestBoard.json";
import erc725schema2 from "@erc725/erc725.js/schemas/LSP8IdentifiableDigitalAsset.json";
import KeyManagerABI from "@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json";
import LSP4DigitalAssetSchema from "@erc725/erc725.js/schemas/LSP4DigitalAsset.json";

dotenv.config();

// testnet
// const provider = new ethers.JsonRpcProvider(
//   "https://rpc.testnet.lukso.network",
//   {
//     chainId: 4201,
//     name: "luksoTestnet",
//   }
// );

const provider = new ethers.JsonRpcProvider(
  "https://42.rpc.thirdweb.com",
  {
    chainId: 42,
    name: "luksoMainnet",
  }
);

const universalProfileAddress = process.env.PUBLIC_KEY!;

async function setData() {
  const obj = {
    verification: {
      method: "keccak256(utf8)",
      data: "0x",
    },
    url: "ipfs://bafybeic5jxkin2zntyksec52lu3zregjwxc6frfpe6b3s627oinzh4eus4/",
  };

  const signer = new Wallet(process.env.PRIVATE_KEY!, provider);
  const nftContract = new Contract(
    process.env.CONTRACT_ADDRESS!,
    abi.abi,
    signer
  );
  
  const baseURIDataKey = ERC725YDataKeys.LSP8["LSP8TokenMetadataBaseURI"];

  const test = encodeData(
    { keyName: "LSP8TokenMetadataBaseURI", value: obj },
    erc725schema2
  );

  const tx = await nftContract.setData(
    baseURIDataKey,
    test.values[0]
  );
  
  await tx.wait();

  const result = await nftContract.getData(baseURIDataKey);

  const decodedBaseURI = ERC725.decodeData(
    [
      {
        keyName: "LSP8TokenMetadataBaseURI",
        value: result,
      },
    ],
    erc725schema2
  );

  console.log(decodedBaseURI);
  console.log("Base URI set to: ", result);
}

// Define the main function
async function main() {
  try {
    // Access the private key from the Hardhat variables
    const deployerPrivateKey = process.env.PRIVATE_KEY!;
    console.log("Deploying contract with account:", deployerPrivateKey);

    // Create a wallet instance using the private key and connect it to the provider
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

async function setCollectionMetadata() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  const ABI = [
    "function execute(uint256 operationType, address target, uint256 value, bytes calldata data) external returns (bytes)",
  ];

  const universalProfile = new ethers.Contract(
    wallet.address,
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
        url: "ipfs://bafkreihrot6eixd4ammpmrt77djjvm6kohku2mm7ml6wh2rbih3aoyvrla",
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

  const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);


  const url =
    "ipfs://QmSb1kwvCZ4u84sc6hrovUgdw94ZWWRNLhdKN8kQBiDyLs";
  const json = JSON.stringify(metadataQuestJson)
  const erc725 = new ERC725(LSP4DigitalAssetSchema);

  const encodedMetadataURI =  erc725.encodeData([
    {
      keyName: "LSP4Metadata",
      value: {
        url,
        json,
      },
    },
  ]);

  const collectionAddress = process.env.CONTRACT_ADDRESS!;
  const tokenId = toBeHex(0, 32);
  const collection = QuestBoard__factory.connect(
    collectionAddress,
    signer
  );

  const tx = await collection.setDataForTokenId(
    tokenId,
    encodedMetadataURI.keys[0],
    encodedMetadataURI.values[0]
  );

  console.log(tx)

  await tx.wait(1);

  console.log(
    await collection.getDataForTokenId(tokenId, encodedMetadataURI.keys[0])
  );
}


// Call the main function
main().catch((error) => {
  console.error("Error in the deployment process:", error);
  process.exitCode = 1;
});
