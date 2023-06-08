// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

import "../src/Bootstrap.sol";
import "../src/AttrMessage.sol";
import "../src/OwnableFactory.sol";
import "../src/Replies.sol";

contract DeployBootstrap is Script {
  function run() external {
    uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    string memory rpc = vm.envString("BOOT_RPC");

    vm.startBroadcast(deployerPrivateKey);

    AttrMessage msgs = new AttrMessage();
    OwnableFactory factory = new OwnableFactory();

    address[] memory attrs = new address[](1);
    attrs[0] = address(msgs);
    Replies replies = new Replies(attrs);

    new Bootstrap(rpc, address(msgs), address(factory), address(replies));

    vm.stopBroadcast();
  }
}
