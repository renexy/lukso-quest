import { useEffect } from "react";
import { Button } from "./ui/button";
import { getQuestByTokenId } from "@/services/firebase";

type QuestInfoProps = {
  goBack: () => void;
  tokenId: number;
};

function QuestInfo({ goBack, tokenId }: QuestInfoProps) {
  useEffect(() => {
    const getQuestInfo = async () => {
      const data = await getQuestByTokenId(tokenId);
      console.log(data, "lol");
    };

    getQuestInfo();
  }, []);
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4 w-full h-full justify-center">
        <Button
          type="button"
          onClick={goBack}
          variant="outline"
          className="cursor-pointer"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default QuestInfo;
