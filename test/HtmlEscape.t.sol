// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../src/HtmlEscape.sol";

contract HtmlEscapeTest is Test {
  function testEscape() public {
    string memory output = HtmlEscape.escape("<a href=\"javascript:alert(`foo${'bar'}`)\">&quot;</a>");
    assertEq(output, "&lt;a href=&quot;javascript:alert(&#96;foo${&#39;bar&#39;}&#96;)&quot;&gt;&amp;quot;&lt;/a&gt;");
  }

}

