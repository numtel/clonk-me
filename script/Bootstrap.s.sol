// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

import "../src/Bootstrap.sol";

contract DeployBootstrap is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    string memory rpc = vm.envString("BOOT_RPC");

    vm.startBroadcast(deployerPrivateKey);

    new Bootstrap(rpc);

    vm.stopBroadcast();
  }
}
