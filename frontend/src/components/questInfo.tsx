/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { getQuestByTokenId } from "@/services/firebase";
import { useUpProvider } from "@/services/UPProvider";
import { getProfileData } from "@/services/web3";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "@radix-ui/react-select";
import Apply from "./apply";

type QuestInfoProps = {
  goBack: () => void;
  tokenId: number;
};

function QuestInfo({ goBack, tokenId }: QuestInfoProps) {
  const { accounts, chainId } = useUpProvider();
  const [loading, setLoading] = useState<boolean>(false);
  const [questData, setQuestData] = useState<any>(null);
  const [userImage, setUserImage] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [apply, setApply] = useState<boolean>(false)

  useEffect(() => {
    const getQuestInfo = async () => {
      const data: any = await getQuestByTokenId(tokenId);
      const ownerAddress = data?.ownerAddress?.toLowerCase();
      const ownerData = await getProfileData(ownerAddress, chainId);
      let ownerProfileImage =
        ownerData?.profileImage && ownerData?.profileImage.length > 0
          ? ownerData.profileImage[0].url
          : "";
      ownerProfileImage = ownerProfileImage.replace(
        "ipfs://",
        "https://ipfs.io/ipfs/"
      );
      setUserName(ownerData.name ?? data?.ownerAddress?.toLowerCase());
      setUserImage(ownerProfileImage);
      setQuestData(data);
      setLoading(false);
    };
    setLoading(true);
    getQuestInfo();
  }, []);

  const navigate = () => {
    const url = `https://universaleverything.io/${questData?.ownerAddress?.toLowerCase()}?network=${
      chainId === 42 ? "mainnet" : "testnet"
    }&assetGroup=grid`;

    window.open(url, "_blank");
  };

  if (loading)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 h-12 w-12" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );

    if (apply) 
      return (<Apply goBack={() => setApply(false)} questData={questData}/>)

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4 w-full h-full justify-between p-10">
        <div className="flex flex-col w-full gap-4 items-center">
          <div className="w-full items-center justify-start flex">
            <h3 className="text-lg font-bold">{questData?.title}</h3>
          </div>
          <div className="w-full items-center justify-start flex gap-4">
            {userImage && (
              <Avatar>
                <AvatarImage src={userImage} alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
            <h3 className="">{userName}</h3>
            <Button
              onClick={navigate}
              className="cursor-pointer"
              variant="outline"
            >
              View Profile
            </Button>
          </div>
          <div className="w-full items-center justify-start flex">
            <h3 className="">{questData?.description}</h3>
          </div>
        </div>

        <ScrollArea className="h-full w-full rounded-md border">
          <div className="flex h-20 w-full justify-evenly items-center">
            <span>Slika</span>
            <span>Ime</span>
          </div>
          <span>yo</span>
          <Separator className="my-2" />
        </ScrollArea>

        <div className="flex gap-8 justify-center items-center">
          <Button
            type="button"
            onClick={goBack}
            variant="outline"
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => setApply(true)}
            className="cursor-pointer"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QuestInfo;
