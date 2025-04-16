// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

contract QuestBoard is LSP8IdentifiableDigitalAsset {
    uint256 public nextQuestId;
    mapping(uint256 => address) public questCreators;
    mapping(uint256 => bool) public questCompleted;

    event QuestCreated(uint256 indexed questId, address indexed creator, string metadataURL);
    event QuestCompleted(uint256 indexed questId, address indexed winner, uint256 xpAwarded);

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

    function createQuest(string calldata metadataURL) external {
        bytes32 tokenId = bytes32(nextQuestId);

        _mint(address(this), tokenId, true, "");

        questCreators[nextQuestId] = msg.sender;

        emit QuestCreated(nextQuestId, msg.sender, metadataURL);
        nextQuestId++;
    }

    function completeQuest(uint256 questId, address winner, uint256 xp) external {
        require(questCreators[questId] == msg.sender, "Not your quest");
        require(!questCompleted[questId], "Quest already completed");

        bytes32 tokenId = bytes32(questId);
        
        _transfer(address(this), winner, tokenId, true, "");

        questCompleted[questId] = true;

        emit QuestCompleted(questId, winner, xp);
    }
}