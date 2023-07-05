// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";

import "../contracts/NFTReplies.sol";
import "../contracts/FreeERC721.sol";

contract NFTRepliesTest is Test, ERC721Holder {
  NFTReplies replies;
  FreeERC721 collection;

  function setUp() public {
    replies = new NFTReplies();
    collection = new FreeERC721();
  }

  function testAddReply() public {
    uint tokenId1 = collection.mint('Heyo');
    uint tokenId2 = collection.mint('Foo');
    replies.addReply(address(collection), tokenId1, address(collection), tokenId2);
  }

  function testAddNewReply() public {
    uint tokenId1 = collection.mint('Heyo');
    bytes memory mintData = abi.encodeWithSignature('mint(string)', 'Foo');
    replies.addNewReply(address(collection), tokenId1, address(collection), mintData);

    (address[] memory internalOut,,) = replies.fetchUnsorted(address(collection), tokenId1, 0, 10, false);
    NFTReplies.Token[] memory tokens = replies.convertInternalToTokens(internalOut);
    assertEq(tokens.length, 1);
    assertEq(tokens[0].collection, address(collection));
    assertEq(tokens[0].tokenId, 2);
  }
}
