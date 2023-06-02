// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


contract HtmlEscape {
  function escape(string memory _input) public pure returns(string memory) {
    bytes memory input = bytes(_input);
    // First pass to determine how much longer output will be
    uint extraLen;
    for(uint i; i<input.length; i++) {
      if(input[i] == 0x26 || input[i] == 0x27 || input[i] == 0x60) {
        // & - important first!
        extraLen += 4; // & &amp;  ' &#39;  ` &#96;
      } else if(input[i] == 0x3c || input[i] == 0x3e) {
        extraLen += 3; // < &lt;   > &gt;
      } else if(input[i] == 0x22) {
        extraLen += 5; // " &quot;
      }
    }
    bytes memory out = new bytes(input.length + extraLen);
    uint j;
    for(uint i; i<input.length; i++) {
      if(input[i] == 0x26) {
        out[j++] = 0x26;
        out[j++] = 0x61;
        out[j++] = 0x6d;
        out[j++] = 0x70;
        out[j++] = 0x3b;
      } else if(input[i] == 0x27) {
        out[j++] = 0x26;
        out[j++] = 0x23;
        out[j++] = 0x33;
        out[j++] = 0x39;
        out[j++] = 0x3b;
      } else if(input[i] == 0x60) {
        out[j++] = 0x26;
        out[j++] = 0x23;
        out[j++] = 0x39;
        out[j++] = 0x36;
        out[j++] = 0x3b;
      } else if(input[i] == 0x3c) {
        out[j++] = 0x26;
        out[j++] = 0x6c;
        out[j++] = 0x74;
        out[j++] = 0x3b;
      } else if(input[i] == 0x3e) {
        out[j++] = 0x26;
        out[j++] = 0x67;
        out[j++] = 0x74;
        out[j++] = 0x3b;
      } else if(input[i] == 0x22) {
        out[j++] = 0x26;
        out[j++] = 0x71;
        out[j++] = 0x75;
        out[j++] = 0x6f;
        out[j++] = 0x74;
        out[j++] = 0x3b;
      } else {
        out[j++] = input[i];
      }
    }
    return string(out);
  }
}
