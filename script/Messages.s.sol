// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

import "../contracts/Messages.sol";

contract Deploy is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    vm.startBroadcast(deployerPrivateKey);

    Messages factory = new Messages();
    address first = factory.postNew(address(0), "First!");
    factory.postNew(first, "My first reply");

    vm.stopBroadcast();
  }
}
