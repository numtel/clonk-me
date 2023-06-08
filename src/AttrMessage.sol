// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Attr.sol";
import "./HtmlEscape.sol";

contract AttrMessage is Attr {
  mapping(address => string) public value;
  mapping(address => uint) public lastSet;

  event ValueSet(address indexed item, string oldValue, string newValue);

  function set(address item, string memory newValue) external onlyItemOwner(item) {
    emit ValueSet(item, value[item], newValue);
    value[item] = newValue;
    lastSet[item] = block.timestamp;
  }

  function render(address item) external virtual override view returns(string memory) {
    return string(abi.encodePacked(
      "<div class=\"message\">",
      HtmlEscape.escape(value[item]),
      "</div>",
      "<div class=\"messageSetAt\">",
      // TODO string library
      lastSet[item],
      "</div>"
    ));
  }
}
