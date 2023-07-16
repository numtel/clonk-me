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
    string memory prefix = 'data:text/plain;base64,';
    uint tokenId = collection.mint(prefix);
    assertEq(collection.tokenURI(tokenId), prefix);

    // Example from https://developer.mozilla.org/en-US/docs/web/http/basics_of_http/data_urls
    collection.appendTokenURI(tokenId, bytes('Hello'));
    collection.appendTokenURI(tokenId, bytes(', world!'));
    assertEq(collection.tokenURI(tokenId), 'data:text/plain;base64,SGVsbG8sIHdvcmxkIQ==');

    collection.setTokenURI(tokenId, 'Foo');
    assertEq(collection.tokenURI(tokenId), 'Foo');

  }
}
