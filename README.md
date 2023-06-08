# On-Chain Messaging App

Uses [BokkyPooBah's Red-Black Binary Search Tree library](https://github.com/bokkypoobah/BokkyPooBahsRedBlackTreeLibrary) to go beyond the unordered sets of [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/api/utils#EnumerableSet) and [Rob Hitchens](https://github.com/rob-Hitchens/SetTypes) by offering the retrieval of items in a desired order.

## Local Development in Browser

```bash
# Start new local chain
$ anvil
# Load Development Config
$ source .env.local
# Deploy Bootstrap
$ forge script script/Bootstrap.s.sol:DeployBootstrap --rpc-url http://localhost:8545 --broadcast -vvvv
# Retrieve Bootstrap snippet
$ cast --abi-decode "copyToAddressBar()(string)" $(cast call 0x5fbdb2315678afecb367f032d93f642f64180aa3 "copyToAddressBar()" --rpc-url $BOOT_RPC)
```
