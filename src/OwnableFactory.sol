// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Ownable.sol";

contract RealOwnable is Ownable {
  constructor(address _owner) {
    _transferOwnership(_owner);
  }
}

contract OwnableFactory {
  function createNew() external returns(address) {
    return address(new RealOwnable(msg.sender));
  }
}
