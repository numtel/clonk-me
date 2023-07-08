// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC4906.sol";
import "openzeppelin-contracts/contracts/interfaces/IERC165.sol";

contract ChunkedERC721 is ERC721, IERC4906 {
  uint256 public tokenCount;
  mapping(uint256 => string[]) _tokenURIs;

  constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, IERC165) returns (bool) {
    return interfaceId == bytes4(0x49064906) || super.supportsInterface(interfaceId);
  }

  function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
    _requireMinted(tokenId);
    bytes memory buffer = abi.encodePacked(_tokenURIs[tokenId][0]);
    for(uint i = 1; i < _tokenURIs[tokenId].length; i++) {
      buffer = abi.encodePacked(buffer, _tokenURIs[tokenId][i]);
    }
    return string(buffer);
  }

  function mint(string memory _tokenURI) external returns (uint256) {
    uint256 newTokenId = ++tokenCount;
    _mint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, _tokenURI);
    return newTokenId;
  }

  function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
    require(_exists(tokenId));
    if(_tokenURIs[tokenId].length == 0) {
      _tokenURIs[tokenId].push(_tokenURI);
    } else {
      while(_tokenURIs[tokenId].length > 1) {
        _tokenURIs[tokenId].pop();
      }
    }
    _tokenURIs[tokenId][0] = _tokenURI;

    emit MetadataUpdate(tokenId);
  }

  function setTokenURI(uint256 tokenId, string memory _tokenURI) external {
    require(ownerOf(tokenId) == msg.sender);
    _setTokenURI(tokenId, _tokenURI);
  }

  function appendTokenURI(uint256 tokenId, string memory chunk) external {
    require(ownerOf(tokenId) == msg.sender);
    _tokenURIs[tokenId].push(chunk);
    emit MetadataUpdate(tokenId);
  }

}