// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../src/AttrMessage.sol";
import "../src/Replies.sol";

contract RepliesTest is Test {
  function testRender(address root, address a1, address a2) public {
    vm.assume(a1 != address(0) && a2 != address(0) && root != address(0));
    vm.assume(a1 != root && a1 != a2 && a2 != root);
    AttrMessage msgs = new AttrMessage();

    address[] memory attrs = new address[](1);
    attrs[0] = address(msgs);
    Replies replies = new Replies(attrs);
    console.logString(replies.render(root));
  }
}
