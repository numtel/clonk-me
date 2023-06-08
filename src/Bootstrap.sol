// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Bootstrap {
  string public rpc;
  address public msgs;
  address public factory;
  address public replies;
  address public contractToLoad;

  constructor(string memory _rpc, address _msgs, address _factory, address _replies) {
    rpc = _rpc;
    msgs = _msgs;
    factory = _factory;
    replies = _replies;
    contractToLoad = address(this);
  }

  function copyToAddressBar() external view returns(string memory) {
    return string(abi.encodePacked(
    "data:text/html,<script>",
    "function h2a(r){const n=Math.ceil(r.length/2),a=new Array(n);for(let i=0;i<n;i++){const b=i*2,c=b+2;a[i]=parseInt(r.slice(b,c),16)}return a}",
    "function u2s(a){return decodeURIComponent(a.reduce((s,b)=>s+=`%${(b<16?'0':'')+b.toString(16)}`,''))}function dES(r){const o=parseInt(r.slice(2,66),16),l=parseInt(r.slice(o*2+2,o*2+66),16),h=r.slice(o*2+66,o*2+66+l*2);return u2s(h2a(h))}",
    "async function fM(a){const r=dES((await(await fetch('", rpc, "',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_call',params:[{from:'0x0000000000000000000000000000000000000000',data:'0xe21f37ce000000000000000000000000',to:a},'latest']})})).json()).result);document.body.innerHTML=r;}",
    "fM('0x", toAsciiString(contractToLoad), "')",
    "</script>"
    ));
  }

  function message() external view returns(string memory) {
    return IRender(replies).render(address(this));
  }

  // https://ethereum.stackexchange.com/a/8447
  function toAsciiString(address x) internal pure returns (string memory) {
    bytes memory s = new bytes(40);
    for (uint i = 0; i < 20; i++) {
      bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
      bytes1 hi = bytes1(uint8(b) / 16);
      bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
      s[2*i] = char(hi);
      s[2*i+1] = char(lo);
    }
    return string(s);
  }

  function char(bytes1 b) internal pure returns (bytes1 c) {
    if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
    else return bytes1(uint8(b) + 0x57);
  }

}

interface IRender {
  function render(address item) external view returns(string memory);
}
