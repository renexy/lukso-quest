import { expect } from "chai";
import { encodeBytes32String } from "ethers";
import { ethers } from "hardhat";

describe("QuestBoard", function () {
  let questBoard: any;
  let owner: any;
  let creator: any;
  let winner: any;

  // Raw metadata string
  const metadataURL = "https://example.com/quest-metadata";

  beforeEach(async () => {
    [owner, creator, winner] = await ethers.getSigners();
    const QuestBoardFactory = await ethers.getContractFactory("QuestBoard");
    
    questBoard = await QuestBoardFactory.deploy(
      "QuestBoard",
      "QST",
      owner.address,
      1,
      0,
      ethers.toUtf8Bytes("test") // properly encode bytes
    );
    await questBoard.waitForDeployment?.(); // Optional for Ethers v6
  });

  describe("createQuest", function () {
    it("Should create a quest successfully", async function () {
      const metadataBytes = ethers.toUtf8Bytes(metadataURL);

      await expect(questBoard.connect(creator).createQuest(metadataBytes))
        .to.emit(questBoard, "QuestCreated")
        .withArgs(0, creator.address);

      expect(await questBoard.questCreators(0)).to.equal(creator.address);
    });
  });

  describe("completeQuest", function () {
    it("Should not allow non-creators to complete quests", async function () {
      const metadataBytes = ethers.toUtf8Bytes(metadataURL);
      await questBoard.connect(creator).createQuest(metadataBytes);

      await expect(
        questBoard.connect(owner).completeQuest(0, winner.address, 50)
      ).to.be.revertedWith("Not your quest");
    });

    it("Should not allow completing a quest that is already completed", async function () {
      const metadataBytes = ethers.toUtf8Bytes(metadataURL);
      await questBoard.connect(creator).createQuest(metadataBytes);

      await questBoard.connect(creator).completeQuest(0, winner.address, 50);

      await expect(
        questBoard.connect(creator).completeQuest(0, winner.address, 50)
      ).to.be.revertedWith("Quest already completed");
    });
  });
});
