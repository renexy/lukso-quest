/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import CreateQuest from "./createQuest";
import { getAllQuests } from "@/services/firebase";
import questIcon from "../../../public/questIcon.webp";
import QuestInfo from "../questInfo";

function Dashboard() {
  const [showCreateQuest, setShowCreateQuest] = useState<boolean>(false);
  const [showQuestInfo, setShowQuestInfo] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<number>(-1);
  const [quests, setQuests] = useState<any>([]);

  useEffect(() => {
    const getQuests = async () => {
      const data = await getAllQuests();
      setQuests(data);
    };

    getQuests();
  }, [showCreateQuest, showQuestInfo]);

  if (showQuestInfo) {
    return (
      <QuestInfo
        goBack={() => setShowQuestInfo(false)}
        tokenId={tokenId}
      ></QuestInfo>
    );
  }

  if (showCreateQuest) {
    return <CreateQuest goBack={() => setShowCreateQuest(false)}></CreateQuest>;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4 w-full h-full justify-between">
        <div className="h-full w-full overflow-y-auto flex flex-wrap gap-8 justify-center items-center p-4">
          {quests.map((item: any, index: number) => (
            <div
              key={index}
              className="w-55 h-82 p-4 bg-white rounded-xl shadow-md flex flex-col justify-between hover:scale-105 transition-transform"
            >
              <div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 overflow-hidden whitespace-nowrap text-ellipsis max-w-[90%]">
                  {item.description}
                </p>
              </div>
              <img
                src={questIcon}
                height={130}
                width={130}
                className="self-center"
              />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-purple-600 font-semibold">
                  {item.reward} LYX
                </span>
                <Button
                  className="cursor-pointer"
                  onClick={() => {
                    setTokenId(item.tokenId);
                    setShowQuestInfo(true);
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          className="cursor-pointer"
          onClick={() => setShowCreateQuest(true)}
        >
          Create Quest
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;
