// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BokkyPooBahsRedBlackTreeLibrary.sol";

library SortableAddressSet {
  using BokkyPooBahsRedBlackTreeLibrary for BokkyPooBahsRedBlackTreeLibrary.Tree;

  struct Set {
    BokkyPooBahsRedBlackTreeLibrary.Tree tree;
    address[] itemList;
    mapping(address => bool) itemExists;
    mapping(address => uint) itemSorts;
    mapping(uint => address) sortItems;
    uint sortedCount;
  }

  function insert(Set storage self, address toAdd) internal {
    require(!self.itemExists[toAdd]);
    self.itemList.push(toAdd);
    self.itemExists[toAdd] = true;
  }

  function setSort(Set storage self, address[] memory items, uint[] memory sortValues) internal {
    require(items.length == sortValues.length);
    for(uint i = 0; i < items.length; i++) {
      require(self.itemExists[items[i]]);
      if(sortValues[i] == self.itemSorts[items[i]]) continue;
      if(self.itemSorts[items[i]] != 0) {
        self.tree.remove(self.itemSorts[items[i]]);
        self.sortItems[self.itemSorts[items[i]]] = address(0);
        if(sortValues[i] == 0) self.sortedCount--;
      } else {
        self.sortedCount++;
      }
      self.itemSorts[items[i]] = sortValues[i];
      self.sortItems[sortValues[i]] = items[i];
      self.tree.insert(sortValues[i]);
    }
  }

  function fetchSorted(Set storage self, address start, uint maxReturned) internal view returns(address[] memory out) {
    uint foundCount;
    uint[] memory foundAll = new uint[](maxReturned);
    foundAll[0] = start == address(0) ? self.tree.first() : self.tree.next(self.itemSorts[start]);

    if(foundAll[0] == 0) return new address[](0);

    while(foundAll[foundCount] > 0) {
      if(foundCount + 1 == maxReturned) {
        foundCount++;
        break;
      }
      foundAll[++foundCount] = self.tree.next(foundAll[foundCount]);
    }

    out = new address[](foundCount);
    for(uint i = 0; i<foundCount; i++) {
      out[i] = self.sortItems[foundAll[i]];
    }
  }

  // This is a separate view function for the client to query before using setSort()
  // It's potentially a lot of computation so no use paying for its gas
  function suggestSorts(Set storage self, address insertAfter, address[] memory toAdd) internal view returns(uint[] memory out) {
    require(insertAfter == address(0) || self.itemSorts[insertAfter] > 0);
    out = new uint[](toAdd.length);
    uint start;
    uint end;
    if(self.tree.root == 0) {
      // tree is empty, even distribution
      end = type(uint).max;
    } else {
      if(insertAfter == address(0)) {
        // inserting to beginning
        end = self.tree.first();
      } else {
        // inserting somewhere after the beginning
        start = self.itemSorts[insertAfter];
        end = self.tree.next(self.itemSorts[insertAfter]);
      }
      // the subsequent items will be moving?
      (,,, uint seqStartPos, uint seqEndPos) = isSequence(self, toAdd);
      if(seqStartPos != 0 && seqStartPos == end) {
        end = self.tree.next(seqEndPos);
      }
    }

    if(end == 0) end = type(uint).max;
    uint step = (end - start) / (toAdd.length + 1);
    for(uint i = 0; i<toAdd.length; i++) {
      out[i] = ((i + 1) * step) + start;
    }

  }

  function isSequence(Set storage self, address[] memory toCheck) internal view returns(uint seqLen, uint seqStart, uint seqEnd, uint start, uint end) {
    uint[] memory nexts = new uint[](toCheck.length);
    uint[] memory pos = new uint[](toCheck.length);
    uint i;
    for(i = 0; i < toCheck.length; i++) {
      pos[i] = self.itemSorts[toCheck[i]];
      if(pos[i] == 0) continue;
      nexts[i] = self.tree.next(pos[i]);
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

