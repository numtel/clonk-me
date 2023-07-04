// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract FreeERC721 is ERC721URIStorage {
  uint256 public tokenCount;

  constructor() ERC721("Clonk.me", "CLONK") {}

  function mint(string memory tokenURI) external returns (uint256) {
    uint256 newTokenId = ++tokenCount;
    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, tokenURI);
    return newTokenId;
  }

  function setTokenURI(uint256 tokenId, string memory tokenURI) external {
    require(ownerOf(tokenId) == msg.sender);
    _setTokenURI(tokenId, tokenURI);
  }
  
}
