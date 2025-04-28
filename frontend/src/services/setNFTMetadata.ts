/* eslint-disable @typescript-eslint/no-explicit-any */


import { ERC725 } from "@erc725/erc725.js";
import { ethers } from "ethers";

const targetContract = import.meta.env.VITE_LUKSO_CONTRACT_ADDRESS

export async function setTokenIdMetadata(metadataJson: any, tokenId: number, ipfsUrl: string) {
    console.log(metadataJson, 'metadatajson');
    console.log(tokenId, 'tokenid');
    console.log(ipfsUrl, 'ipfsurl');
    const provider = new ethers.JsonRpcProvider("https://rpc.testnet.lukso.network", {
      chainId: 4201,
      name: "luksoTestnet",
    });
    const wallet = new ethers.Wallet("0x43361a4e65f999bb2fe735d873f393763a931121a4f4ee4d775e8a3cd228a34a", provider);
    
    const universalProfileAddress = "0x61d397d2c872F521c0A0BCD13d1cb31ec2c8Bc05";
    const ABI = [
      "function execute(uint256 operationType, address target, uint256 value, bytes calldata data) external returns (bytes)"
    ];
  
    const universalProfile = new ethers.Contract(
      universalProfileAddress,
      ABI,
      wallet
    );
  
    const schema = [
      {
        name: 'LSP4Metadata',
        key: '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e',
        keyType: 'Singleton',
        valueType: 'bytes',
        valueContent: 'VerifiableURI',
      },
    ];
  
    const erc725 = new ERC725(schema);
  
    const encodedData = erc725.encodeData([
      {
        keyName: 'LSP4Metadata',
        value: {
          json: metadataJson,
          url: ipfsUrl,
        },
      },
    ]);
  
    // Encode the setData function call
    const setDataInterface = new ethers.Interface([
      "function setDataForTokenId(bytes32 tokenId, bytes32 key, bytes value) external"
    ]);
  
    const newTokenId = ethers.zeroPadValue(ethers.toBeHex(tokenId), 32);

    console.log(newTokenId, 'lolčič')
  
    const setDataData = setDataInterface.encodeFunctionData("setDataForTokenId", [
        newTokenId,
      encodedData.keys[0],
      encodedData.values[0]
    ]);
  
    // Call execute on the Universal Profile
    const tx = await universalProfile.execute(
      0, // CALL operation
      targetContract, // target contract
      0, // value (0 ETH)
      setDataData // encoded setData call
    );
    await tx.wait();
  }
  