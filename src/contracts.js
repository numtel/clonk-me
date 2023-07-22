import { encodePacked, keccak256 } from 'viem';

import repliesABI from './abi/NFTReplies.json';
import chunkedERC721ABI from './abi/ChunkedERC721.json';

export const defaultChain = 137;

export const byChain = {
  80001: {
    name: 'Mumbai',
    nativeCurrency: 'tMATIC',
    replies: {
      address: '0x410271248184c57dda4b91f6d5faf34d9f47e68d',
      abi: repliesABI,
      chainId: 80001,
    },
    ChunkedERC721: {
      address: '0xd3da00f83032c8608b74dff3d4ee61c1f1343544',
      abi: chunkedERC721ABI,
      chainId: 80001,
    },
  },
  5: {
    name: 'Goerli',
    nativeCurrency: 'gETH',
    replies: {
      address: '0x36A93a593c9c149197369D36d199DAA15EedF3D2',
      abi: repliesABI,
      chainId: 5,
    },
    ChunkedERC721: {
      address: '0xe78ad78dc3943785168d000ad4095185be9d0f66',
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
