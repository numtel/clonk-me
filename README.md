# Clonk.me

Contracts (using Foundry) and frontend for dApp that lets users reply to any NFT with any NFT that they own. NFT holders can then sort the replies they receive in order to bring more attention to the ones they prefer.

Frontend currently supports creating new NFTs using the included ChunkedERC721 as plaintext, file upload, or external resource. The goal is to have the frontend support many type of NFT mints though. Contributions welcome!

## Installation

```sh
$ git clone https://github.com/numtel/clonk-me
$ cd clonk-me
$ yarn
$ yarn start
```

## Contracts

### [NFTReplies](contracts/NFTReplies.sol)

Core contract for receiving and sorting replies to NFTs.

Uses [BokkyPooBah's Red-Black Binary Search Tree library](https://github.com/bokkypoobah/BokkyPooBahsRedBlackTreeLibrary) to go beyond the unordered sets of [OpenZeppelin](https://docs.openzeppelin.com/contracts/4.x/api/utils#EnumerableSet) and [Rob Hitchens](https://github.com/rob-Hitchens/SetTypes) by offering the retrieval of items in a desired order.

An NFT cannot be a reply to the same parent NFT more than once but it can be a reply to multiple different parent NFTs.

Includes paginated view functions for `fetchSorted` and `fetchUnsorted`.

The `suggestSorts` view function returns sort value integers evenly spaced within the bounds of the neighboring replies while taking into account if any of the replies being sorted are those neighbors.

The parent NFT holder may 'eliminate' undesired replies by setting their sort value to `type(uint256).max`. This will hide the reply from `fetchSorted` and `fetchUnsorted` while still not allowing the same reply posted again under this parent.

> Although this 'elimination' can be undone, there is no way to enumerate the eliminated replies [on chain].

Owners of NFTs as replies can `rescindReply` to remove their reply from a parent NFT.

There's a convenience function for minting a new NFT and adding it as a reply in one transaction, `addNewReply` which accepts the `childCollection` address to call and the calldata bytes necessary to mint the token. The new token is transferred to the invoking account before completion.

### [ChunkedERC721](contracts/ChunkedERC721.sol)

This is a freely-mintable ERC721 contract that allows token owners to set the tokenURI as they wish as well as a mechanism for appending binary data to the tokenURI which will be returned in base64 for generating data URIs.

Includes a function `uploadEstimateDummy` for calculating the amount of gas necessary to store an upload chunk. Do not send any transactions to this function as it will be a waste of gas.

## Common commands

```bash
# Deploy NFTReplies to Mumbai
$ RUST_BACKTRACE=1 forge script script/NFTReplies.s.sol:Deploy --rpc-url https://rpc-mumbai.maticvigil.com/ --broadcast --legacy --verify -vvvv
# Deploy NFTReplies to Goerli
$ forge script script/NFTReplies.s.sol:Deploy --rpc-url https://rpc.ankr.com/eth_goerli  --broadcast --verify -vvvv
```

## Deployment configuration

To deploy the contracts, set the following values in a `.env` file.

```
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
```

## License

MIT
