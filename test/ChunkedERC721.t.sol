// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "openzeppelin-contracts/contracts/token/ERC721/utils/ERC721Holder.sol";

import "../contracts/ChunkedERC721.sol";

contract ChunkedERC721Test is Test, ERC721Holder {
  ChunkedERC721 collection;

  function setUp() public {
    collection = new ChunkedERC721('Test', 'TEST');
  }

  function testMultichunk() public {
    uint tokenId = collection.mint('Hello');
    assertEq(collection.tokenURI(tokenId), 'Hello');

    collection.appendTokenURI(tokenId, ', world!');
    assertEq(collection.tokenURI(tokenId), 'Hello, world!');

    collection.setTokenURI(tokenId, 'Foo');
    assertEq(collection.tokenURI(tokenId), 'Foo');

  }
}
