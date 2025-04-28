/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonRpcProvider } from "ethers";
import LSP8ABI from "../../abi/lsp8.json";
import * as ethers from "ethers";

// Function to decode Verifiable URI (JSONURL format)
function decodeVerifiableURI(dataValue: string): { encodingType: string; hashValue: string; url: string } | null {
  if (!dataValue || dataValue === "0x") {
    return null;
  }

  try {
    const hexValue = dataValue.slice(2); // Remove 0x prefix
    const encodingType = hexValue.slice(0, 4); // First 2 bytes (4 hex chars) for encoding
    if (encodingType !== "0000") {
      throw new Error(`Unsupported encoding type: ${encodingType}`);
    }
    const hashValue = hexValue.slice(4, 68); // Next 32 bytes (64 hex chars) for keccak256 hash
    const url = ethers.toUtf8String(`0x${hexValue.slice(68)}`); // Remaining bytes as UTF-8 string
    return { encodingType, hashValue, url };
  } catch (error) {
    console.error("Error decoding Verifiable URI:", error);
    return null;
  }
}

// Function to compute a token-specific metadata key
function getTokenSpecificMetadataKey(tokenId: string): string {
  const baseKey = "LSP4Metadata:";
  const keyString = baseKey + tokenId;
  return ethers.keccak256(ethers.toUtf8Bytes(keyString));
}

async function fetchLsp8Metadata(contract: any, tokenIds: any) {
  const metadata: any[] = [];

  for (const tokenId of tokenIds) {
    try {
      console.log(`Fetching metadata for tokenId: ${tokenId}`);

      // Try contract-wide LSP4Metadata key (padded to 32 bytes)
      const contractWideKey = ethers.zeroPadValue("0x9afb95cacc9f95858ec44aa2c3b635ac", 32);
      let dataValue = await contract.getData(contractWideKey);
      console.log(`Raw LSP4Metadata value (contract-wide): ${dataValue}`);

      let decodedMetadata = null;
      if (dataValue && dataValue !== "0x") {
        decodedMetadata = decodeVerifiableURI(dataValue);
      }

      // If no valid metadata from contract-wide key, try token-specific key
      if (!decodedMetadata) {
        const tokenSpecificKey = getTokenSpecificMetadataKey(tokenId);
        console.log(`Trying token-specific key: ${tokenSpecificKey}`);
        dataValue = await contract.getData(tokenSpecificKey);
        console.log(`Raw LSP4Metadata value (token-specific): ${dataValue}`);

        if (dataValue && dataValue !== "0x") {
          decodedMetadata = decodeVerifiableURI(dataValue);
        }
      }

      if (decodedMetadata) {
        console.log(`Decoded metadata for tokenId ${tokenId}:`, decodedMetadata);

        if (decodedMetadata.url.startsWith("ipfs://")) {
          const ipfsHash = decodedMetadata.url.replace("ipfs://", "");
          const ipfsUrl = `https://ipfs.io/ipfs/${ipfsHash}`;
          console.log(`Fetching metadata from IPFS: ${ipfsUrl}`);

          const response = await fetch(ipfsUrl);
          const jsonMetadata = await response.json();
          console.log(`JSON metadata for tokenId ${tokenId}:`, jsonMetadata);

          metadata.push({
            tokenId,
            metadata: jsonMetadata,
            url: decodedMetadata.url,
          });
        } else {
          metadata.push({
            tokenId,
            metadata: decodedMetadata,
            url: decodedMetadata.url,
          });
        }
      } else {
        console.log(`No valid metadata found for tokenId ${tokenId}`);
        metadata.push({ tokenId, metadata: null });
      }
    } catch (error) {
      console.error(`Error fetching metadata for tokenId ${tokenId}:`, error);
      metadata.push({ tokenId, metadata: null });
    }
  }

  return metadata;
}

export const fetchOwnedLSP8Tokens = async (upAddress: string, lsp8Address: string) => {
  const provider = new JsonRpcProvider("https://rpc.testnet.lukso.network");
  const contract = new ethers.Contract(lsp8Address, LSP8ABI.abi, provider);
  const tokens: string[] = [];

  try {
    const totalSupply = Number(await contract.totalSupply()); // Total tokens ever minted
    for (let i = 0; i < totalSupply; i++) {
      try {
        const tokenId = ethers.zeroPadValue(ethers.toBeHex(i), 32);
        const owner = await contract.tokenOwnerOf(tokenId);
        console.log(owner, "ownrelol");
        if (owner.toLowerCase() === upAddress.toLowerCase()) {
          tokens.push(tokenId);
        }
      } catch (innerErr) {
        console.warn(`Error checking token at index ${i}:`, innerErr);
      }
    }

    console.log("User owns tokens:", tokens);

    // Fetch metadata for owned tokens
    let metadata: any[] = [];
    if (tokens.length > 0) {
      metadata = await fetchLsp8Metadata(contract, tokens);
      console.log("Metadata for owned tokens:", metadata);
    }

    return { tokens, metadata };
  } catch (err) {
    console.error("Error fetching tokens:", err);
    return { tokens: [], metadata: [] };
  }
};
