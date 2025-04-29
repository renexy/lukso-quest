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
        uint8 lsp8TokenIdFormat_,
        bytes memory metadata
    )
        LSP8IdentifiableDigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            lsp8TokenIdFormat_
        )
    {
        _setData(hex"9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e", metadata);
    }

    function createQuest(bytes memory metadata) external payable {
        bytes32 tokenId = bytes32(nextQuestId);

        _mint(msg.sender, tokenId, true, "");
        _setDataForTokenId(tokenId, hex"9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e", metadata);

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

        _transfer(msg.sender, winner, tokenId, true, "");

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
