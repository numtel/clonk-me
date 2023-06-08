// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library StrPos {
  function inStr(string memory _haystack, string memory _needle, uint startPos) internal pure returns(uint) {
    bytes memory haystack = bytes(_haystack);
    bytes memory needle = bytes(_needle);
    require(haystack.length >= needle.length && needle.length > 0);
    uint j;
    for(uint i = startPos; i< haystack.length; i++) {
      if(haystack[i] == needle[j]) {
        if(++j == needle.length) {
          return (i + 1) - needle.length;
        }
      } else {
        j = 0;
      }
    }
    return haystack.length;
  }
}
