import { encodePacked, keccak256 } from 'viem';

import messagesABI from './abi/Messages.json';
import repliesABI from './abi/NFTReplies.json';
import chunkedERC721ABI from './abi/ChunkedERC721.json';

export const defaultChain = 137;

export const byChain = {
  137: {
    name: 'Polygon',
    messages: {
      address: '0xcfa3756d600dba87dcf300556fb5143ce5d388b1',
      abi: messagesABI,
      chainId: 137,
      chainName: 'Polygon',
    },
    root: '0xd961512c485f01fb972ff25de42a3097aa661140',
  },
  5: {
    name: 'Goerli',
    replies: {
      address: '0x36A93a593c9c149197369D36d199DAA15EedF3D2',
      abi: repliesABI,
      chainId: 5,
    },
    ChunkedERC721: {
      address: '0xb208648581f5ea464fcd2c22fe2b59e2bf339a69',
      abi: chunkedERC721ABI,
      chainId: 5,
    },
  },
  80001: {
    name: 'Mumbai',
    messages: {
      address: '0xa02E508f9D264bC9e73670038C955E9FC76a5C78',
      abi: messagesABI,
      chainId: 80001,
      chainName: 'Mumbai',
    },
    replies: {
      address: '0x10c05fe61d4ca86a29f9afe5607bbde533f04a1e',
      abi: repliesABI,
      chainId: 80001,
    },
    root: '0x696296b40866AeF2f07C4ee66eCE1e06bc6654c5',
  },
};


export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  else return byChain[defaultChain];
}

export function convertToInternal(collection, tokenId) {
  return '0x' + keccak256(encodePacked(['address', 'uint256'], [collection, tokenId])).slice(-40);
}
