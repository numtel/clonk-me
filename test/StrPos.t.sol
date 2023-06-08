// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../src/StrPos.sol";

contract StrPosTest is Test {
  function testInStr(string memory s1, string memory s2) public {
    assertEq(StrPos.inStr("foobar", "foo", 0), 0);
    assertEq(StrPos.inStr("foobar", "bar", 0), 3);
    assertEq(StrPos.inStr("foobarbazbar", "bar", 4), 9);
    assertEq(StrPos.inStr("foobarbazbar", "boo", 4), bytes("foobarbazbar").length); // not found
    assertEq(StrPos.inStr(s1, s1, 0), 0);
  }
}

