import { expect } from "chai";
import { ethers } from "hardhat";

describe("QuestBoard", function () {
  let QuestBoard;
  let questBoard: any;
  let owner: any;
  let creator: any;
  let winner: any;

  const metadataURL = "https://example.com/quest-metadata";

  beforeEach(async () => {
    [owner, creator, winner] = await ethers.getSigners();
    const QuestBoardFactory = await ethers.getContractFactory("QuestBoard");
    questBoard = await QuestBoardFactory.deploy("QuestBoard", "QST", owner.address, 1, 0);
  });

  describe("createQuest", function () {
    it("Should create a quest successfully", async function () {
      await expect(questBoard.connect(creator).createQuest(metadataURL))
        .to.emit(questBoard, "QuestCreated")
        .withArgs(0, creator.address, metadataURL);

      expect(await questBoard.questCreators(0)).to.equal(creator.address);
    });
  });

  describe("completeQuest", function () {
    it("Should not allow non-creators to complete quests", async function () {
      await questBoard.connect(creator).createQuest(metadataURL);
      await expect(
        questBoard.connect(owner).completeQuest(0, winner.address, 50)
      ).to.be.revertedWith("Not your quest");
    });

    it("Should not allow completing a quest that is already completed", async function () {
      await questBoard.connect(creator).createQuest(metadataURL);
      await questBoard.connect(creator).completeQuest(0, winner.address, 50);
      await expect(
        questBoard.connect(creator).completeQuest(0, winner.address, 50)
      ).to.be.revertedWith("Quest already completed");
    });
  });
});
