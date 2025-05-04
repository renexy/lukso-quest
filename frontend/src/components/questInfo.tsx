/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { deleteQuestByTokenId, getQuestByTokenId } from "@/services/firebase";
import { useUpProvider } from "@/services/UPProvider";
import { completeQuest, getProfileData } from "@/services/web3";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "@radix-ui/react-select";
import Apply from "./apply";
import discord from "/discord.svg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import toast from "react-hot-toast";

type QuestInfoProps = {
  goBack: () => void;
  tokenId: number;
};

function QuestInfo({ goBack, tokenId }: QuestInfoProps) {
  const { accounts, chainId, client } = useUpProvider();
  const [loading, setLoading] = useState<boolean>(false);
  const [questData, setQuestData] = useState<any>(null);
  const [userImage, setUserImage] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [apply, setApply] = useState<boolean>(false);
  const [participants, setParticipants] = useState<any>([]);

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

      const p = data.participants ?? [];
      console.log(p, 'lol')

      const enrichedParticipants = await Promise.all(
        p.map(async (participant: any) => {
          const userData = await getProfileData(
            participant.walletAddress,
            chainId
          );
          let userImage =
            userData?.profileImage && userData.profileImage.length > 0
              ? userData.profileImage[0].url
              : "";

          userImage = userImage.replace("ipfs://", "https://ipfs.io/ipfs/");

          return {
            ...participant,
            userData,
            userImage,
          };
        })
      );

      setParticipants(enrichedParticipants ?? []);

      setUserName(ownerData?.name ?? data?.ownerAddress?.toLowerCase());
      setUserImage(ownerProfileImage);
      setQuestData(data);
      setLoading(false);
    };
    setLoading(true);
    getQuestInfo();
  }, [apply]);

  const navigate = () => {
    const url = `https://universaleverything.io/${questData?.ownerAddress?.toLowerCase()}?network=${
      chainId === 42 ? "mainnet" : "testnet"
    }&assetGroup=grid`;

    window.open(url, "_blank");
  };

  const viewParticipantProfile = (walletAddress: string) => {
    const url = `https://universaleverything.io/${walletAddress}?assetType=owned&assetGroup=collectibles&orderBy=name-asc&search=Questboard`;
    window.open(url, "_blank");
  };

  const getUsername = (user: any) => {
    if (user?.userData?.name) return user.userData.name;

    const address = user?.walletAddress;
    if (address && address.length >= 8) {
      return (
        address.substring(0, 4) + "..." + address.substring(address.length - 4)
      );
    }

    return address ?? "";
  };

  const isUserOwner = () => {
    const connectedUser = accounts[0].toLowerCase();
    if (connectedUser === questData?.ownerAddress) return true;
    return false;
  };

  const navigateExternal = (url: string) => {
    window.open(url, "_blank");
  };

  const chooseWinner = async (winner: string) => {
    try {
      setLoading(true);
      await completeQuest(
        chainId,
        client,
        accounts[0],
        questData?.tokenId,
        winner
      );
      await deleteQuestByTokenId(questData?.tokenId);
    } catch (error: any) {
      console.error(error);
      toast.error("Error occured!");
    } finally {
      toast.success('Winner awarded!')
      goBack()
      setLoading(false);
    }
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
    return <Apply goBack={() => setApply(false)} questData={questData} />;

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

        <h1 className="font-bold">Participants</h1>
        <ScrollArea className="h-80 w-full rounded-md border">
          {participants.length > 0 ? (
            participants.map((item: any, index: number) => {
              return (
                <>
                  <div
                    key={index}
                    className="flex w-full justify-center items-center px-4 pt-6 pb-2"
                  >
                    <div className="flex h-full w-full justify-between items-center">
                      <span className="w-2/3 flex items-center justify-start gap-2">
                        {item.userImage && (
                          <Avatar>
                            <AvatarImage src={item.userImage} alt="@shadcn" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                        )}
                        <span>{getUsername(item)} </span>
                        <Button
                          className="cursor-pointer"
                          variant="outline"
                          onClick={() =>
                            viewParticipantProfile(item.walletAddress)
                          }
                        >
                          View Profile
                        </Button>
                      </span>
                      <span className="w-full/3 flex items-center justify-end gap-4">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <img
                                className="cursor-pointer"
                                src={discord}
                                height={24}
                                width={24}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.discord}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          className="cursor-pointer"
                          variant="outline"
                          onClick={() => {
                            navigateExternal(item.powLink);
                          }}
                        >
                          POW
                        </Button>
                        {isUserOwner() && (
                          <Button className="cursor-pointer" onClick={() => chooseWinner(item.walletAddress)}>
                            Accept Submission
                          </Button>
                        )}
                      </span>
                    </div>
                  </div>
                  <Separator className="m-2 h-[1px] bg-gray-400" />
                </>
              );
            })
          ) : (
            <span>No participants yet</span>
          )}
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
