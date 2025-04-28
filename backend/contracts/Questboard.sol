// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

contract QuestBoard is LSP8IdentifiableDigitalAsset {
    uint256 public nextQuestId;
    mapping(uint256 => address) public questCreators;
    mapping(uint256 => bool) public questCompleted;
    mapping(uint256 => uint256) public questRewards; // questId => LYX amount

    event QuestCreated(uint256 indexed questId, address indexed creator);
    event QuestCompleted(
        uint256 indexed questId,
        address indexed winner,
        uint256 xpAwarded
    );

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint8 lsp4TokenType_,
        uint8 lsp8TokenIdFormat_
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
    {}

    function createQuest() external payable {
        bytes32 tokenId = bytes32(nextQuestId);

        _mint(address(this), tokenId, true, "");

        questCreators[nextQuestId] = msg.sender;
        questRewards[nextQuestId] = msg.value;

        emit QuestCreated(nextQuestId, msg.sender);
        nextQuestId++;
    }

    function completeQuest(
        uint256 questId,
        address winner,
        uint256 xp
    ) external {
        require(questCreators[questId] == msg.sender, "Not your quest");
        require(!questCompleted[questId], "Quest already completed");

        bytes32 tokenId = bytes32(questId);

        _transfer(address(this), winner, tokenId, true, "");

        uint256 reward = questRewards[questId];
        questRewards[questId] = 0;
        questCompleted[questId] = true;

        if (reward > 0) {
            (bool sent, ) = winner.call{value: reward}("");
            require(sent, "Reward transfer failed");
        }

        questCompleted[questId] = true;

        emit QuestCompleted(questId, winner, xp);
    }
}
