// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SortableAddressSet.sol";

contract Messages {
  using SortableAddressSet for SortableAddressSet.Set;
  mapping(address => address[]) public userMessages;
  mapping(address => uint) public userMessageCount;

  event NewMessage(address indexed item, address indexed author, address indexed parent, string message);
  event MessageChanged(address indexed item, string oldMsg, string newMsg);
  event MessageOwnerChanged(address indexed item, address indexed oldOwner, address indexed newOwner);

  struct Message {
    address owner;
    address parent;
    string message;
    uint createdAt;
    uint lastChanged;
  }
  mapping(address => SortableAddressSet.Set) replies;
  mapping(address => Message) msgs;

  function getMsg(address item) external view returns(Message memory) {
    return msgs[item];
  }

  function postNew(address parent, string memory message) external returns(address) {
    address newAddr = address(uint160(uint256(keccak256(abi.encodePacked(msg.sender, userMessages[msg.sender].length)))));

    require(msgs[newAddr].owner == address(0));
    msgs[newAddr].owner = msg.sender;
    msgs[newAddr].parent = parent;
    msgs[newAddr].message = message;
    msgs[newAddr].createdAt = block.timestamp;
    msgs[newAddr].lastChanged = 0;
    if(parent != address(0)) {
      replies[parent].insert(newAddr);
    }
    userMessages[msg.sender].push(newAddr);
    userMessageCount[msg.sender]++;
    emit NewMessage(newAddr, msg.sender, parent, message);
    return newAddr;
  }

  function setMessage(address item, string memory newMsg) external {
    require(msg.sender == msgs[item].owner);
    emit MessageChanged(item, msgs[item].message, newMsg);
    msgs[item].lastChanged = block.timestamp;
    msgs[item].message = newMsg;
  }

  function sortedCount(address item) public view returns(uint) {
    return replies[item].sortedCount;
  }

  function unsortedCount(address item) public view returns(uint) {
    return replies[item].itemList.length - replies[item].sortedCount;
  }

  function fetchUnsorted(address item, uint startIndex, uint fetchCount, bool reverseScan) public view returns(address[] memory out, uint totalCount, uint lastScanned) {
    return replies[item].fetchUnsorted(startIndex, fetchCount, reverseScan);
  }

  function fetchSorted(address item, address start, uint maxReturned, bool reverseScan) public view returns(address[] memory out) {
    return replies[item].fetchSorted(start, maxReturned, reverseScan);
  }

  function suggestSorts(address item, address insertAfter, address[] memory toAdd) external view returns(uint[] memory out) {
    return replies[item].suggestSorts(insertAfter, toAdd);
  }

  function getSortIndex(address item) external view returns(uint) {
    return replies[msgs[item].parent].getSortIndex(item);
  }

  // TODO add special sort level to delete the reply
  function setSort(address item, address[] memory ofItems, uint[] memory sortValues) external {
    require(msg.sender == msgs[item].owner);
    replies[item].setSort(ofItems, sortValues);
  }

  function fetchUserMessages(address user, uint startIndex, uint fetchCount, bool reverseScan) external view returns(address[] memory out, uint totalCount, uint lastScanned) {
    totalCount = userMessages[user].length;
    if(totalCount > 0) {
      require(startIndex < totalCount);

      if(startIndex + fetchCount >= totalCount) {
        fetchCount = totalCount - startIndex;
      }

      address[] memory selection = new address[](fetchCount);
      uint activeCount;

      lastScanned = startIndex;
      if(reverseScan) {
        lastScanned = totalCount - 1 - startIndex;
      }

      while(true) {
        address curAddr = userMessages[user][lastScanned];
        Message storage cur = msgs[curAddr];
        if(cur.owner == user) {
          selection[activeCount++] = curAddr;
          if(activeCount == fetchCount) break;
        }
        if(reverseScan) {
          if(lastScanned == 0) break;
          lastScanned--;
        } else {
          if(lastScanned == totalCount - 1) break;
          lastScanned++;
        }
      }

      // Crop the output
      out = new address[](activeCount);
      for(uint i=0; i<activeCount; i++) {
        out[i] = selection[i];
      }
    }
  }

  // Should accounts have to accept a transfer?
  // No drive-by give powerful position to vitalik?
  function transferOwnership(address[] memory messages, address newOwner) external {
    for(uint i = 0; i < messages.length; i++) {
      Message storage cur = msgs[messages[i]];
      require(cur.owner == msg.sender);
      emit MessageOwnerChanged(messages[i], msg.sender, newOwner);
      cur.owner = newOwner;
      userMessageCount[msg.sender]--;
      userMessageCount[newOwner]++;
      // Messages are added to the new owner's profile
      // but not removed from old owner's
      // The fetchUserMessages function filters them on read
      //  (no gas this way)
      userMessages[newOwner].push(messages[i]);
    }
  }
  
  
}
