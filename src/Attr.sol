// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

abstract contract Attr {
  function render(address item) external virtual view returns(string memory);

  modifier onlyItemOwner(address item) {
    // TODO provision to allow permits for bundling transactions
    require(IOwnable(item).owner() == msg.sender, "Ownable: caller is not the owner");
    _;
  }
}

interface IOwnable {
  function owner() external view returns(address);
}
