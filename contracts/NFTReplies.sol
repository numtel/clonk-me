// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";

import "./SortableAddressSet.sol";

contract NFTReplies {
  using SortableAddressSet for SortableAddressSet.Set;
  mapping(address => mapping(uint256 => SortableAddressSet.Set)) replies;
  mapping(address => uint256) _replyAddedTime;
  mapping(address => Token) _reverseInternalAddr;

  struct Token {
    address collection;
    uint256 tokenId;
  }

  function calcInternalAddr(address collection, uint256 tokenId) public pure returns (address) {
    return address(uint160(uint256(keccak256(abi.encodePacked(collection, tokenId)))));
  }

  function addReply(
    address parentCollection, uint256 parentTokenId,
    address childCollection, uint256 childTokenId
  ) public {
    require(IERC721(childCollection).ownerOf(childTokenId) == msg.sender);

    address internalAddr = calcInternalAddr(childCollection, childTokenId);
    replies[parentCollection][parentTokenId].insert(internalAddr);
    _replyAddedTime[internalAddr] = block.timestamp;
    _reverseInternalAddr[internalAddr] = Token(childCollection, childTokenId);
  }

  // So users don't have to make 2 tx for a reply
  function addNewReply(
    address parentCollection, uint256 parentTokenId,
    address childCollection, string memory tokenURI
  ) external {
    MintableERC721 collection = MintableERC721(childCollection);
    uint256 newTokenId = collection.mint(tokenURI);
    collection.safeTransferFrom(address(this), msg.sender, newTokenId);
    addReply(parentCollection, parentTokenId, childCollection, newTokenId);
  }

  function replyAddedTime(address collection, uint256 tokenId) external view returns(uint) {
    return _replyAddedTime[calcInternalAddr(collection, tokenId)];
  }

  function sortedCount(address collection, uint256 tokenId) public view returns(uint) {
    return replies[collection][tokenId].sortedCount;
  }

  function unsortedCount(address collection, uint256 tokenId) public view returns(uint) {
    return replies[collection][tokenId].itemList.length - replies[collection][tokenId].sortedCount;
  }

  function fetchUnsorted(address collection, uint256 tokenId, uint startIndex, uint fetchCount, bool reverseScan) public view returns(address[] memory out, uint totalCount, uint lastScanned) {
    return replies[collection][tokenId].fetchUnsorted(startIndex, fetchCount, reverseScan);
  }

  function fetchSorted(address collection, uint256 tokenId, address start, uint maxReturned, bool reverseScan) public view returns(address[] memory out) {
    return replies[collection][tokenId].fetchSorted(start, maxReturned, reverseScan);
  }

  function convertInternalToTokens(address[] memory input) public view returns(Token[] memory out) {
    out = new Token[](input.length);
    for(uint i = 0; i < out.length; i++) {
      out[i] = _reverseInternalAddr[input[i]];
    }
  }

  function suggestSorts(address collection, uint256 tokenId, address insertAfter, address[] memory toAdd) external view returns(uint[] memory out) {
    return replies[collection][tokenId].suggestSorts(insertAfter, toAdd);
  }

  // TODO add special sort level to delete the reply
  function setSort(address collection, uint256 tokenId, address[] memory ofItems, uint[] memory sortValues) external {
    require(IERC721(collection).ownerOf(tokenId) == msg.sender);
    replies[collection][tokenId].setSort(ofItems, sortValues);
  }
}

interface MintableERC721 {
  function mint(string memory tokenURI) external returns (uint256);
  function safeTransferFrom(address from, address to, uint256 tokenId) external;
}
