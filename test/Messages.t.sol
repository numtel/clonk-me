// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../contracts/Messages.sol";

contract MessagesTest is Test {
  function testTransferOwnership(string memory msg1, string memory msg2, address newOwner) public {
    Messages factory = new Messages();
    address root = factory.postNew(address(0), msg1);

    address[] memory toTransfer = new address[](1);
    toTransfer[0] = root;

    // Only works for message creator
    vm.expectRevert();
    vm.prank(address(0));
    factory.transferOwnership(toTransfer, newOwner);

    factory.transferOwnership(toTransfer, newOwner);

    // Both accounts have the post listed now
    (address[] memory msgs, uint totalCount) = factory.fetchUserMessages(address(this), 0, 1);
    assertEq(totalCount, 1);
    assertEq(msgs[0], root);

    (msgs, totalCount) = factory.fetchUserMessages(newOwner, 0, 1);
    assertEq(totalCount, 1);
    assertEq(msgs[0], root);

    assertEq(factory.getMsg(root).owner, newOwner);

    vm.prank(newOwner);
    factory.setMessage(root, msg2);

    assertEq(factory.getMsg(root).message, msg2);
  }

  function testEdit(address prankster, string memory msg1, string memory msg2) public {
    vm.assume(prankster != address(this));

    Messages factory = new Messages();
    address rootAddr = factory.postNew(address(0), msg1);
    Messages.Message memory root = factory.getMsg(rootAddr);
    assertEq(root.createdAt, block.timestamp);
    assertEq(root.lastChanged, 0);
    assertEq(root.message, msg1);


    // Only works for message creator
    vm.expectRevert();
    vm.prank(prankster);
    factory.setMessage(rootAddr, msg2);


    factory.setMessage(rootAddr, msg2);
    root = factory.getMsg(rootAddr);
    assertEq(root.message, msg2);
    assertEq(root.lastChanged, block.timestamp);
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

    (fetched, totalCount,) = factory.fetchUnsorted(root, 0, 10, false);
    assertEq(fetched.length, 2);
    assertEq(fetched[0], reply1);
    assertEq(fetched[1], reply2);
    assertEq(totalCount, 2);
  }
}
