// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../src/AttrMessage.sol";
import "../src/OwnableFactory.sol";
import "../src/Replies.sol";
import "../src/StrPos.sol";

contract BootstrapTest is Test {
  function testBootstrap() public {
    // fuzzing not worth it here?
    string memory str1 = "Hello, \"world\"";
    string memory str2 = "<b>Foobar</b>";
    string memory str3 = "<a>";

    AttrMessage msgs = new AttrMessage();
    OwnableFactory factory = new OwnableFactory();
    Replies replies = new Replies();

    address a1 = factory.createNew();
    address a2 = factory.createNew();
    address a3 = factory.createNew();

    msgs.set(a2, str1);
    msgs.set(a3, str2);

    // a1 is root with 2 children
    replies.addReply(a1, a2);
    replies.addReply(a1, a3);

    address[] memory attrs = new address[](1);
    attrs[0] = address(msgs);

    replies.setRenderAttrs(attrs);

    string memory rendered = replies.render(a1);
    // Both messages are included
    assertGt(StrPos.inStr(rendered, HtmlEscape.escape(str1), 0), 0);
    assertGt(StrPos.inStr(rendered, HtmlEscape.escape(str2), 0), 0);

    assertEq(StrPos.inStr(rendered, HtmlEscape.escape(str3), 0), bytes(rendered).length);

    console.logString(rendered);
  }

}
