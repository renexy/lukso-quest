/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "../ui/slider";
import toast from "react-hot-toast";
import axios from "axios";
import { createQuest, getNextQuestId } from "@/services/web3";
import { useUpProvider } from "@/services/UPProvider";
import { addQuest } from "@/services/firebase";

type CreateQuestProps = {
  goBack: () => void;
};

function CreateQuest({ goBack }: CreateQuestProps) {
  const { chainId, client, accounts } = useUpProvider();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState(20); // in LYX
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();

    if (!name || !description) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      const tokenId = await getNextQuestId(chainId);

      // 2. Upload metadata to pinata with tokenID from contract
      await uploadToPinata(tokenId);

      // 1. Call create quest on contract
      await createQuest(chainId, reward.toString(), client, accounts[0]);

      await addQuest(
        tokenId,
        name,
        accounts[0],
        description,
        reward.toString()
      );

      setLoading(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const uploadToPinata = async (
    tokenId: number
  ): Promise<{ ipfsUrl: string; downloadedJson: any }> => {
    try {
      const json = {
        LSP4Metadata: {
          name,
          description,
          links: [
            {
              title: "Twitter",
              url: "https://x.com/Kolleger4",
            },
          ],
          icon: [
            {
              width: 1280,
              height: 720,
              url: "ipfs://bafkreiad43dj2d6elalgs3hm4cqljstrryryupwlxgq2njkc7uxvr4ma7e",
              verification: {
                method: "keccak256(bytes)",
                data: "0x9a87cdfa13ea14c0ead92c447c90018611f5e39fcc89b21252606555a484aee5",
              },
            },
          ],
          images: [
            [
              {
                width: 1280,
                height: 720,
                url: "ipfs://bafkreiad43dj2d6elalgs3hm4cqljstrryryupwlxgq2njkc7uxvr4ma7e",
                verification: {
                  method: "keccak256(bytes)",
                  data: "0x9a87cdfa13ea14c0ead92c447c90018611f5e39fcc89b21252606555a484aee5",
                },
              },
            ],
          ],
          assets: [],
          attributes: [],
        },
      };

      const body = {
        pinataMetadata: {
          name: `quest-${tokenId}.json`,
        },
        pinataContent: json,
      };

      const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
      const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY;

      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        body,
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretKey,
          },
        }
      );

      const ipfsUrl = `ipfs://${res.data.IpfsHash}`;
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;

      // 📥 Step: Download the JSON from Pinata (IPFS gateway)
      const downloadedRes = await axios.get(gatewayUrl);
      const downloadedJson = downloadedRes.data;

      return { ipfsUrl, downloadedJson };
    } catch (error) {
      console.error(error);
      throw new Error("Failed!");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4 w-full h-full justify-center">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create Quest</CardTitle>
            <CardDescription>
              Create your new quest in one-click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name of your quest"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description of your quest"
                  />
                </div>
                <div className="flex flex-col space-y-1.5 gap-4">
                  <Label htmlFor="reward">LYX Reward</Label>
                  <Slider
                    defaultValue={[reward]}
                    max={100}
                    step={1}
                    onValueChange={(val) => setReward(val[0])}
                  />
                  <p className="text-sm text-muted-foreground">{reward} LYX</p>
                </div>
              </div>
              <CardFooter className="flex justify-between pt-6 px-0">
                <Button
                  disabled={loading}
                  type="button"
                  onClick={goBack}
                  variant="outline"
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  disabled={loading}
                  type="submit"
                  onClick={handleSubmit}
                  className="cursor-pointer"
                >
                  Deploy
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CreateQuest;
