import { encodePacked, keccak256 } from 'viem';

import repliesABI from './abi/NFTReplies.json';
import chunkedERC721ABI from './abi/ChunkedERC721.json';

import {EditChunkedERC721} from './components/EditChunkedERC721.js';

export const defaultChain = 80001;

export const byChain = {
  80001: {
    name: 'Mumbai',
    nativeCurrency: 'tMATIC',
    replies: {
      address: '0x6b9d13d91800dbe046f00151b826d78e542ae15c',
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
      address: '0x1fb5a790dfeca87461917706922dd12e7d154007',
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

export const methods = {
  ChunkedERC721: {
    edit: (props) => (<EditChunkedERC721 {...props} />),
  }
}


export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  throw new Error('INVALID_CHAIN');
}

export function convertToInternal(collection, tokenId) {
  return '0x' + keccak256(encodePacked(['address', 'uint256'], [collection, tokenId])).slice(-40);
}
