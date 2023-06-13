// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../contracts/Messages.sol";

contract MessagesTest is Test {
  function testTransferOwnership() public {
    Messages factory = new Messages();
    Message root = Message(factory.postNew(address(0), "Foo"));

    address[] memory toTransfer = new address[](1);
    toTransfer[0] = address(root);

    // Only works for message creator
    vm.expectRevert();
    vm.prank(address(0));
    factory.transferOwnership(toTransfer, address(1));

    factory.transferOwnership(toTransfer, address(1));

    // Both accounts have the post listed now
    (address[] memory msgs, uint totalCount) = factory.fetchUserMessages(address(this), 0, 1);
    assertEq(totalCount, 1);
    assertEq(msgs[0], address(root));

    (msgs, totalCount) = factory.fetchUserMessages(address(1), 0, 1);
    assertEq(totalCount, 1);
    assertEq(msgs[0], address(root));

    assertEq(root.owner(), address(1));
  }

  function testEdit(string memory msg1, string memory msg2) public {
    Messages factory = new Messages();
    Message root = Message(factory.postNew(address(0), msg1));
    assertEq(root.createdAt(), block.timestamp);
    assertEq(root.lastChanged(), 0);
    assertEq(root.message(), msg1);


    // Only works for message creator
    vm.expectRevert();
    vm.prank(address(0));
    root.setMessage(msg2);


    root.setMessage(msg2);
    assertEq(root.message(), msg2);
    assertEq(root.lastChanged(), block.timestamp);
  }

  function testFailAddReplyNotFactory(address addr1) public {
    Messages factory = new Messages();
    Message root = Message(factory.postNew(address(0), "fooey"));
    root.addReply(addr1);
  }

  function testUserMessages(string memory msg1, string memory msg2, string memory msg3) public {
    Messages factory = new Messages();
    address root = factory.postNew(address(0), msg1);
    address reply1 = factory.postNew(root, msg2);
    address reply2 = factory.postNew(root, msg3);

    (address[] memory fetched, uint totalCount) = factory.fetchUserMessages(address(this), 0, 1);

    assertEq(fetched.length, 1);
    assertEq(fetched[0], root);
    assertEq(totalCount, 3);

    (fetched, totalCount) = factory.fetchUserMessages(address(this), 1, 2);

    assertEq(fetched.length, 2);
    assertEq(fetched[0], reply1);
    assertEq(fetched[1], reply2);
    assertEq(totalCount, 3);
  }
}
