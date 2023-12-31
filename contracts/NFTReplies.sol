// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC721/IERC721.sol";

import "./SortableAddressSet.sol";

contract NFTReplies {
  using SortableAddressSet for SortableAddressSet.Set;
  mapping(address => mapping(uint256 => SortableAddressSet.Set)) replies;
  mapping(address => mapping(address => uint256)) public replyAddedTime;
  mapping(address => mapping(address => address)) public replyAddedAccount;
  mapping(address => Token) public reverseInternalAddr;
  mapping(address => NewReply[]) public notifications;
  mapping(address => address[]) public parents;

  struct NewReply {
    address parentInternal;
    address childInternal;
  }

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

    address parentInternalAddr = calcInternalAddr(parentCollection, parentTokenId);
    address internalAddr = calcInternalAddr(childCollection, childTokenId);
    replies[parentCollection][parentTokenId].insert(internalAddr);
    replyAddedTime[parentInternalAddr][internalAddr] = block.timestamp;
    replyAddedAccount[parentInternalAddr][internalAddr] = msg.sender;
    reverseInternalAddr[internalAddr] = Token(childCollection, childTokenId);
    if(reverseInternalAddr[parentInternalAddr].collection == address(0)) {
      reverseInternalAddr[parentInternalAddr] = Token(parentCollection, parentTokenId);
    }

    // Parents are not removed if a reply is eliminated
    parents[internalAddr].push(parentInternalAddr);
    // Notifications go to the current owner of the token
    notifications[IERC721(parentCollection).ownerOf(parentTokenId)].push(
      NewReply(parentInternalAddr, internalAddr));
  }

  // So users don't have to make 2 tx for a reply
  function addNewReply(
    address parentCollection, uint256 parentTokenId,
    address childCollection, bytes memory data
  ) external {
    (bool success, bytes memory returned) = childCollection.call(data);
    require(success);
    uint256 newTokenId = uint256(bytes32(returned));
    IERC721(childCollection).safeTransferFrom(address(this), msg.sender, newTokenId);
    addReply(parentCollection, parentTokenId, childCollection, newTokenId);
  }

  function notificationCount(address recipient) external view returns(uint) {
    return notifications[recipient].length;
  }

  function parentCount(address internalAddr) external view returns(uint) {
    return parents[internalAddr].length;
  }

  function fetchParent(address internalAddr, uint index) external view returns(Token memory) {
    return reverseInternalAddr[parents[internalAddr][index]];
  }

  function sortedCount(address collection, uint256 tokenId) public view returns(uint) {
    return replies[collection][tokenId].sortedCount;
  }

  function unsortedCount(address collection, uint256 tokenId) public view returns(uint) {
    return replies[collection][tokenId].itemList.length - replies[collection][tokenId].sortedCount - replies[collection][tokenId].removedCount;
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
      out[i] = reverseInternalAddr[input[i]];
    }
  }

  function suggestSorts(address collection, uint256 tokenId, address insertAfter, address[] memory toAdd) external view returns(uint[] memory out) {
    return replies[collection][tokenId].suggestSorts(insertAfter, toAdd);
  }

  function setSort(address collection, uint256 tokenId, address[] memory ofItems, uint[] memory sortValues) public {
    require(IERC721(collection).ownerOf(tokenId) == msg.sender);
    replies[collection][tokenId].setSort(ofItems, sortValues);
  }

  struct SortSet {
    address collection;
    uint256 tokenId;
    address[] ofItems;
    uint[] sortValues;
  }

  function setSortMany(SortSet[] memory sorts) external {
    for(uint i = 0; i < sorts.length; i++) {
      setSort(sorts[i].collection, sorts[i].tokenId, sorts[i].ofItems, sorts[i].sortValues);
    }
  }

  function rescindReply(address parentCollection, uint256 parentTokenId, address replyCollection, uint256 replyTokenId) public {
    require(IERC721(replyCollection).ownerOf(replyTokenId) == msg.sender);
    address[] memory ofItems = new address[](1);
    ofItems[0] = calcInternalAddr(replyCollection, replyTokenId);
    uint256[] memory sortValues = new uint256[](1);
    sortValues[0] = type(uint).max;
    replies[parentCollection][parentTokenId].setSort(ofItems, sortValues);
  }
}
