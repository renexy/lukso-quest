/* eslint-disable @typescript-eslint/no-explicit-any */
import { createPublicClient, http, parseUnits } from "viem";
import abi from "../../abi/QuestBoard.json"
import { lukso, luksoTestnet } from "viem/chains";

const contractAddress = import.meta.env.VITE_LUKSO_CONTRACT_ADDRESS;

export const createQuest = async (
  chainId: any,
  entryFee: string,
  walletClient: any,
  account: any
) => {
  try {
    
    const entryFeeInWei = parseUnits(entryFee, 18);
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: abi.abi,
      functionName: "createQuest",
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
    throw new Error('Failed');
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
  account: any
) => {
  try {
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: abi.abi,
      functionName: "completeQuest",
      args: [0, "0x61d397d2c872F521c0A0BCD13d1cb31ec2c8Bc05", 50],
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

