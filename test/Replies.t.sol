// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../src/Replies.sol";

contract RepliesTest is Test {
  function testRender(address root, address a1, address a2) public {
    vm.assume(a1 != address(0) && a2 != address(0) && root != address(0));
    vm.assume(a1 != root && a1 != a2 && a2 != root);
    Replies instance = new Replies();
    console.logString(instance.render(root));
  }
}
