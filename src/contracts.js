import { encodePacked, keccak256 } from 'viem';

import repliesABI from './abi/NFTReplies.json';
import chunkedERC721ABI from './abi/ChunkedERC721.json';

export const defaultChain = 137;

export const byChain = {
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
