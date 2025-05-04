/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPublicClient, http, parseUnits } from "viem";
import abi from "../../abi/QuestBoard.json";
import { lukso, luksoTestnet } from "viem/chains";
import ERC725 from "@erc725/erc725.js";
import profileSchema from "@erc725/erc725.js/schemas/LSP3ProfileMetadata.json";

const contractAddress = import.meta.env.VITE_LUKSO_CONTRACT_ADDRESS;

export const createQuest = async (
  chainId: any,
  entryFee: string,
  json: any,
  ipfsUrl: any,
  walletClient: any,
  account: any
) => {
  try {
    const schema = [
      {
        name: "LSP4Metadata",
        key: "0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e",
        keyType: "Singleton",
        valueType: "bytes",
        valueContent: "VerifiableURI",
      },
    ];
    const erc725 = new ERC725(schema);

    const encodedData = erc725.encodeData([
      {
        keyName: "LSP4Metadata",
        value: {
          json: json,
          url: ipfsUrl,
        },
      },
    ]);

    const entryFeeInWei = parseUnits(entryFee, 18);
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: abi.abi,
      functionName: "createQuest",
      args: [encodedData.values[0]],
      value: entryFeeInWei,
      account: account,
    });

    const publicClient = createPublicClient({
      chain: chainId === 42 ? lukso : luksoTestnet,
      transport: http(),
    });

    await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return 1;
  } catch (error) {
    console.error("Error", error);
    throw new Error("Failed");
  }
};

export const getNextQuestId = async (chainId: any) => {
  try {
    const publicClient = createPublicClient({
      chain: chainId === 42 ? lukso : luksoTestnet,
      transport: http(),
    });

    const nextQuestId = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: abi.abi,
      functionName: "nextQuestId",
    });

    return Number(nextQuestId); // convert from BigInt if needed
  } catch (error) {
    console.error("Error getting nextQuestId", error);
    return -1;
  }
};

export const completeQuest = async (
  chainId: any,
  walletClient: any,
  account: any,
  tokenId: number,
  winner: any
) => {
  try {
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: abi.abi,
      functionName: "completeQuest",
      args: [tokenId, winner, 50],
      account: account,
    });

    const publicClient = createPublicClient({
      chain: chainId === 42 ? lukso : luksoTestnet,
      transport: http(),
    });

    await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    return 1;
  } catch (error) {
    console.error("Error", error);
    return -1;
  }
};

export const getProfileData = async (account: any, chainId: any) => {
  const erc725js = new ERC725(
    profileSchema,
    account, // Universal Profile address
    chainId === 42
      ? "https://rpc.mainnet.lukso.network"
      : "https://rpc.testnet.lukso.network",
    {
      ipfsGateway: "https://api.universalprofile.cloud/ipfs/",
    }
  );
  const encodedProfileData = await erc725js.getData();
  try {
    if (!encodedProfileData || encodedProfileData.length < 1) return;
    const link = encodedProfileData!.find(
      (e) => e.dynamicName === "LSP3Profile"
    );
    const value = link?.value as any;
    const gatewayUrl = value.url?.replace("ipfs://", "https://ipfs.io/ipfs/");
    const response = await fetch(gatewayUrl);
    if (!response.ok) throw new Error("Failed to fetch IPFS data");

    const text = await response.json();
    if (text.LSP3Profile)
      return text.LSP3Profile;
  } catch (error) {
    console.error("Error fetching IPFS data:", error);
  }
};
