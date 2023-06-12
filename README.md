# On-Chain Messaging App

Uses [BokkyPooBah's Red-Black Binary Search Tree library](https://github.com/bokkypoobah/BokkyPooBahsRedBlackTreeLibrary) to go beyond the unordered sets of [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/api/utils#EnumerableSet) and [Rob Hitchens](https://github.com/rob-Hitchens/SetTypes) by offering the retrieval of items in a desired order.

## Deploy to Mumbai

```bash
$ forge script script/Messages.s.sol:Deploy --rpc-url https://rpc-mumbai.maticvigil.com/ --broadcast --verify -vvvv
```
