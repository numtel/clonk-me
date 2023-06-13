// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Ownable.sol";
import "./SortableAddressSet.sol";

contract Message is Ownable {
  using SortableAddressSet for SortableAddressSet.Set;

  SortableAddressSet.Set replies;
  string public message;
  address public factory;
  address public parent;
  uint public lastChanged;
  uint public createdAt;

  event MessageChanged(string oldMsg, string newMsg);

  constructor(address _owner, address _parent, string memory _msg) {
    _transferOwnership(_owner);
    message = _msg;
    parent = _parent;
    factory = msg.sender;
    createdAt = block.timestamp;
  }

  function setMessage(string memory newMsg) external onlyOwner {
    emit MessageChanged(message, newMsg);
    lastChanged = block.timestamp;
    message = newMsg;
  }

  function sortedCount() public view returns(uint) {
    return replies.sortedCount;
  }

  function unsortedCount() public view returns(uint) {
    return replies.itemList.length - replies.sortedCount;
  }

  function addReply(address reply) external {
    require(msg.sender == factory);
    replies.insert(reply);
  }

  function fetchUnsorted(uint startIndex, uint fetchCount, bool reverseScan) public view returns(address[] memory out, uint totalCount, uint lastScanned) {
    return replies.fetchUnsorted(startIndex, fetchCount, reverseScan);
  }

  function fetchSorted(address start, uint maxReturned) public view returns(address[] memory out) {
    return replies.fetchSorted(start, maxReturned);
  }

  function suggestSorts(address insertAfter, address[] memory toAdd) external view returns(uint[] memory out) {
    return replies.suggestSorts(insertAfter, toAdd);
  }

  function setSort(address[] memory ofItems, uint[] memory sortValues) external onlyOwner {
    replies.setSort(ofItems, sortValues);
  }

  function transferOwnership(address newOwner) external {
    require(msg.sender == factory);
    _transferOwnership(newOwner);
  }
}

contract Messages {
  mapping(address => address[]) public userMessages;

  event NewMsg(address indexed item, address indexed author, address indexed parent, string message);

  function postNew(address parent, string memory message) external returns(address) {
    Message newMsg = new Message(msg.sender, parent, message);
    if(parent != address(0)) {
      Message(parent).addReply(address(newMsg));
    }
    userMessages[msg.sender].push(address(newMsg));
    emit NewMsg(address(newMsg), msg.sender, parent, message);
    return address(newMsg);
  }

  function fetchUserMessages(address user, uint startIndex, uint fetchCount) external view returns(address[] memory out, uint totalCount) {
    if(userMessages[user].length > 0) {

      require(startIndex < userMessages[user].length);

      if(startIndex + fetchCount >= userMessages[user].length) {
        fetchCount = userMessages[user].length - startIndex;
      }

      totalCount = userMessages[user].length;
      out = new address[](fetchCount);
      for(uint i = 0; i < fetchCount; i++) {
        out[i] = userMessages[user][i + startIndex];
      }
    }
  }

  function transferOwnership(address[] memory messages, address newOwner) external {
    for(uint i = 0; i < messages.length; i++) {
      Message cur = Message(messages[i]);
      require(cur.owner() == msg.sender);
      cur.transferOwnership(newOwner);
      // Messages are added to the new owner's profile
      // but not removed from old owner's
      userMessages[newOwner].push(messages[i]);
    }
  }
  
  
}
