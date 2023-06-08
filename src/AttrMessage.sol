// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Attr.sol";
import "./HtmlEscape.sol";
import "./BokkyPooBahsDateTimeLibrary.sol";

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
    (uint year, uint month, uint day, uint hour, uint minute, uint second) = BokkyPooBahsDateTimeLibrary.timestampToDateTime(lastSet[item]);
    return string(abi.encodePacked(
      "<div class=\"message\">",
      HtmlEscape.escape(value[item]),
      "</div>",
      "<div class=\"messageSetAt\">",
      uint2str(year), "-", uint2str(month), "-", uint2str(day),
      " ", uint2str(hour), ":", uint2str(minute), ":", uint2str(second),
      "</div>"
    ));
  }

  // https://stackoverflow.com/a/65707309
  function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
      return "0";
    }
    uint j = _i;
    uint len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint k = len;
    while (_i != 0) {
      k = k-1;
      uint8 temp = (48 + uint8(_i - _i / 10 * 10));
      bytes1 b1 = bytes1(temp);
      bstr[k] = b1;
      _i /= 10;
    }
    return string(bstr);
  }
}
