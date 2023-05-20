// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

import "../src/SortableAddressSet.sol";

contract SortableAddressSetTest is Test {
  using SortableAddressSet for SortableAddressSet.Set;

  SortableAddressSet.Set instance;

  function testBasic(address a1, address a2, address a3) public {
    // No dupes!
    vm.assume(a1 != a2 && a1 != a3 && a2 != a3);

    instance.insert(a1);
    instance.insert(a2);
    instance.insert(a3);

    address[] memory toSort = new address[](3);
    toSort[0] = a1;
    toSort[1] = a2;
    toSort[2] = a3;
    uint[] memory sortValues = new uint[](3);
    sortValues[0] = 200;
    sortValues[1] = 300;
    sortValues[2] = 100;
    instance.setSort(toSort, sortValues);

    address[] memory fetched = instance.fetchSorted();
    assertEq(fetched.length, 3);
    assertEq(fetched[0], a3);
    assertEq(fetched[1], a1);
    assertEq(fetched[2], a2);
  }

  function testIsSequence(address a1, address a2, address a3) public {
    // No dupes!
    vm.assume(a1 != a2 && a1 != a3 && a2 != a3);

    instance.insert(a1);
    instance.insert(a2);
    instance.insert(a3);

    address[] memory toSort = new address[](3);
    toSort[0] = a1;
    toSort[1] = a2;
    toSort[2] = a3;
    uint[] memory sortValues = new uint[](3);
    sortValues[0] = 200;
    sortValues[1] = 300;
    sortValues[2] = 100;
    instance.setSort(toSort, sortValues);

    (uint seqLen, uint seqStart, uint seqEnd, uint start, uint end) = instance.isSequence(toSort);
    assertEq(seqLen, 3);
    assertEq(seqStart, 2);
    assertEq(seqEnd, 1);
    assertEq(start, 100);
    assertEq(end, 300);

    address[] memory testSeq2 = new address[](2);
    testSeq2[0] = a1;
    testSeq2[1] = a3;
    (seqLen, seqStart, seqEnd, start, end) = instance.isSequence(testSeq2);
    assertEq(seqLen, 2);
    assertEq(seqStart, 1);
    assertEq(seqEnd, 0);
    assertEq(start, 100);
    assertEq(end, 200);

    address[] memory testSeq3 = new address[](2);
    testSeq3[0] = a2;
    testSeq3[1] = a3;
    (seqLen, seqStart, seqEnd, start, end) = instance.isSequence(testSeq3);
    assertEq(seqLen, 1);
    assertEq(seqStart, 1);
    assertEq(seqEnd, 1);
    assertEq(start, 100);
    assertEq(end, 100);
  }

  function testSuggestIntoEmpty(address a1, address a2, address a3) public {
    // No dupes!
    vm.assume(a1 != a2 && a1 != a3 && a2 != a3);

    instance.insert(a1);

    address[] memory toAdd = new address[](2);
    toAdd[0] = a3;
    toAdd[1] = a2;
    uint[] memory suggested = instance.suggestSorts(address(0), toAdd);
    assertEq(suggested.length, 2);
    // Looking for correct spacing
    assertEq(suggested[0], 0x5555555555555555555555555555555555555555555555555555555555555555);
    assertEq(suggested[1], 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa);

    toAdd = new address[](3);
    toAdd[0] = a3;
    toAdd[1] = a2;
    toAdd[2] = a1;
    suggested = instance.suggestSorts(address(0), toAdd);
    assertEq(suggested.length, 3);
    assertEq(suggested[0], 0x3fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
    assertEq(suggested[1], 0x7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe);
    assertEq(suggested[2], 0xbffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd);

    toAdd = new address[](1);
    toAdd[0] = a3;
    suggested = instance.suggestSorts(address(0), toAdd);
    assertEq(suggested.length, 1);
    assertEq(suggested[0], 0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
  }

  function testSuggestIntoSingle(address a1, address a2, address a3) public {
    vm.assume(a1 != address(0) && a2 != address(0) && a3 != address(0));
    // No dupes!
    vm.assume(a1 != a2 && a1 != a3 && a2 != a3);

    instance.insert(a1);

    address[] memory toSort = new address[](1);
    toSort[0] = a1;
    uint[] memory sortValues = new uint[](1);
    sortValues[0] = 200;
    instance.setSort(toSort, sortValues);

    // Test inserting after a1
    address[] memory toAdd = new address[](2);
    toAdd[0] = a3;
    toAdd[1] = a2;
    uint[] memory suggested = instance.suggestSorts(a1, toAdd);
    assertEq(suggested.length, 2);
    // Looking for correct spacing
    assertEq(suggested[0], 0x55555555555555555555555555555555555555555555555555555555555555da);
    assertEq(suggested[1], 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaec);

    // Test inserting before a1
    suggested = instance.suggestSorts(address(0), toAdd);
    assertEq(suggested.length, 2);
    // Looking for correct spacing
    assertEq(suggested[0], 66);
    assertEq(suggested[1], 132);
  }

  function testSuggestIntoDouble(address a1, address a2, address a3, address a4) public {
    vm.assume(a1 != address(0) && a2 != address(0) && a3 != address(0) && a4 != address(0));
    // No dupes!
    vm.assume(a1 != a2 && a1 != a3 && a2 != a3 && a1 != a4 && a2 != a4 && a3 != a4);

    instance.insert(a1);
    instance.insert(a2);
    instance.insert(a3);
    instance.insert(a4);

    address[] memory toSort = new address[](2);
    toSort[0] = a1;
    toSort[1] = a4;
    uint[] memory sortValues = new uint[](2);
    sortValues[0] = 200;
    sortValues[1] = 300;
    instance.setSort(toSort, sortValues);

    // Test inserting between a1 and a4
    address[] memory toAdd = new address[](2);
    toAdd[0] = a3;
    toAdd[1] = a2;
    uint[] memory suggested = instance.suggestSorts(a1, toAdd);
    assertEq(suggested.length, 2);
    // Looking for correct spacing
    assertEq(suggested[0], 233);
    assertEq(suggested[1], 266);

    instance.setSort(toAdd, suggested);

    // Resorting a2,a3 should still result in same suggestions
    suggested = instance.suggestSorts(a1, toAdd);
    assertEq(suggested.length, 2);
    // Looking for correct spacing
    assertEq(suggested[0], 233);
    assertEq(suggested[1], 266);

    // Inserting the first 2 items at the beginning again
    address[] memory toAdd2 = new address[](2);
    toAdd2[0] = a1;
    toAdd2[1] = a3;
    suggested = instance.suggestSorts(address(0), toAdd2);
    assertEq(suggested.length, 2);
    // Looking for correct spacing
    assertEq(suggested[0], 88);
    assertEq(suggested[1], 176);

    // Inserting the last 2 items at the end again
    address[] memory toAdd3 = new address[](2);
    toAdd3[0] = a2;
    toAdd3[1] = a4;
    suggested = instance.suggestSorts(a3, toAdd3);
    assertEq(suggested.length, 2);
    // Looking for correct spacing
    assertEq(suggested[0], 0x55555555555555555555555555555555555555555555555555555555555555f0);
    assertEq(suggested[1], 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaf7);
  }
}

