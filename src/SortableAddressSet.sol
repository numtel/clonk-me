// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BokkyPooBahsRedBlackTreeLibrary.sol";

contract SortableAddressSet {
  using BokkyPooBahsRedBlackTreeLibrary for BokkyPooBahsRedBlackTreeLibrary.Tree;

  BokkyPooBahsRedBlackTreeLibrary.Tree tree;
  address[] public itemList;
  mapping(address => bool) public itemExists;
  mapping(address => uint) public itemSorts;
  mapping(uint => address) public sortItems;
  uint public sortedCount;

  function insert(address toAdd) external {
    require(!itemExists[toAdd]);
    itemList.push(toAdd);
    itemExists[toAdd] = true;
  }

  function setSort(address[] memory items, uint[] memory sortValues) external {
    require(items.length == sortValues.length);
    for(uint i = 0; i < items.length; i++) {
      require(itemExists[items[i]]);
      if(sortValues[i] == itemSorts[items[i]]) continue;
      if(itemSorts[items[i]] != 0) {
        tree.remove(itemSorts[items[i]]);
        sortItems[itemSorts[items[i]]] = address(0);
        if(sortValues[i] == 0) sortedCount--;
      } else {
        sortedCount++;
      }
      itemSorts[items[i]] = sortValues[i];
      sortItems[sortValues[i]] = items[i];
      tree.insert(sortValues[i]);
    }
  }

  function fetchSorted() external view returns(address[] memory out) {
    out = new address[](sortedCount);
    if(sortedCount == 0) return out;
    out[0] = sortItems[tree.first()];
    for(uint i = 1; i < sortedCount; i++) {
      out[i] = sortItems[tree.next(itemSorts[out[i - 1]])];
    }
  }

  // This is a separate view function for the client to query before using setSort()
  // It's potentially a lot of computation so no use paying for its gas
  function suggestSorts(address insertAfter, address[] memory toAdd) external view returns(uint[] memory out) {
    require(insertAfter == address(0) || itemSorts[insertAfter] > 0);
    out = new uint[](toAdd.length);
    uint start;
    uint end;
    if(tree.root == 0) {
      // tree is empty, even distribution
      end = type(uint).max;
    } else {
      if(insertAfter == address(0)) {
        // inserting to beginning
        end = tree.first();
      } else {
        // inserting somewhere after the beginning
        start = itemSorts[insertAfter];
        end = tree.next(itemSorts[insertAfter]);
      }
      // the subsequent items will be moving?
      (,,, uint seqStartPos, uint seqEndPos) = isSequence(toAdd);
      if(seqStartPos != 0 && seqStartPos == end) {
        end = tree.next(seqEndPos);
      }
    }

    if(end == 0) end = type(uint).max;
    uint step = (end - start) / (toAdd.length + 1);
    for(uint i = 0; i<toAdd.length; i++) {
      out[i] = ((i + 1) * step) + start;
    }

  }

  function isSequence(address[] memory toCheck) public view returns(uint seqLen, uint seqStart, uint seqEnd, uint start, uint end) {
    uint[] memory nexts = new uint[](toCheck.length);
    uint[] memory pos = new uint[](toCheck.length);
    uint i;
    for(i = 0; i < toCheck.length; i++) {
      pos[i] = itemSorts[toCheck[i]];
      if(pos[i] == 0) continue;
      nexts[i] = tree.next(pos[i]);
      if(start == 0 || pos[i] < start) {
        start = end = pos[i];
        // Start from the beginning
        seqEnd = seqStart = i;
      }
    }
    i = 0;
    seqLen = 1;
    while(i != toCheck.length) {
      for(i = 0; i < toCheck.length; i++) {
        if(pos[i] == 0) continue;
        if(pos[i] == nexts[seqEnd]) {
          seqEnd = i;
          end = pos[i];
          seqLen++;
          break;
        }
      }
    }

  }
}

