import { encodePacked, keccak256 } from 'viem';

import repliesABI from './abi/NFTReplies.json';
import chunkedERC721ABI from './abi/ChunkedERC721.json';

export const defaultChain = 137;

export const byChain = {
  80001: {
    name: 'Mumbai',
    replies: {
      address: '0x410271248184c57dda4b91f6d5faf34d9f47e68d',
      abi: repliesABI,
      chainId: 80001,
    },
    ChunkedERC721: {
      address: '0xD59c6e0A4f3A56f98a1137499267ccE3bBA32086',
      abi: chunkedERC721ABI,
      chainId: 80001,
    },
  },
  5: {
    name: 'Goerli',
    replies: {
      address: '0x36A93a593c9c149197369D36d199DAA15EedF3D2',
      abi: repliesABI,
      chainId: 5,
    },
    ChunkedERC721: {
      address: '0x6b4d2a78e69b98bd0b30356ffb3702096e0d5a51',
      abi: chunkedERC721ABI,
      chainId: 5,
    },
  },
};


export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  else return byChain[defaultChain];
}

export function convertToInternal(collection, tokenId) {
  return '0x' + keccak256(encodePacked(['address', 'uint256'], [collection, tokenId])).slice(-40);
}
