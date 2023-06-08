// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./SortableAddressSet.sol";
import "./Attr.sol";

contract Replies is Attr {
  using SortableAddressSet for SortableAddressSet.Set;
  address[] public attrs;

  mapping(address => SortableAddressSet.Set) items;

  constructor(address[] memory _newVals) {
    attrs = _newVals;
  }

  function render(address item) external virtual override view returns(string memory) {
    if(items[item].itemList.length == 0) {
      return "<div class=\"replies none\">No replies yet</div>";
    }

    // TODO fix paging
    (address[] memory unsorted,,) = fetchUnsorted(item, 0, 10, true);
    bytes memory buff = bytes("<div class=\"replies\">");
    for(uint i = 0; i < unsorted.length; i++) {
      for(uint j = 0; j < attrs.length; j++) {
        buff = abi.encodePacked(buff, Attr(attrs[j]).render(unsorted[i]));
      }
    }
    return string(abi.encodePacked(buff, "</div>"));
  }

  function sortedCount(address item) public view returns(uint) {
    return items[item].sortedCount;
  }

  function unsortedCount(address item) public view returns(uint) {
    return items[item].itemList.length - items[item].sortedCount;
  }

  function addReply(address item, address reply) external {
    items[item].insert(reply);
  }

  function fetchUnsorted(address item, uint startIndex, uint fetchCount, bool reverseScan) public view returns(address[] memory out, uint totalCount, uint lastScanned) {
    return items[item].fetchUnsorted(startIndex, fetchCount, reverseScan);
  }

  function fetchSorted(address item, address start, uint maxReturned) public view returns(address[] memory out) {
    return items[item].fetchSorted(start, maxReturned);
  }

  function suggestSorts(address item, address insertAfter, address[] memory toAdd) external view returns(uint[] memory out) {
    return items[item].suggestSorts(insertAfter, toAdd);
  }

  function setSort(address item, address[] memory ofItems, uint[] memory sortValues) external onlyItemOwner(item) {
    items[item].setSort(ofItems, sortValues);
  }
}

