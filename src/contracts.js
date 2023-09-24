import { encodePacked, keccak256 } from 'viem';

import repliesABI from './abi/NFTReplies.json';
import chunkedERC721ABI from './abi/ChunkedERC721.json';

import {EditChunkedERC721} from './components/EditChunkedERC721.js';

export const defaultChain = 137;

export const byChain = {
  10: {
    name: 'Optimism',
    explorer: 'https://optimistic.etherscan.io/',
    nativeCurrency: 'ETH',
    replies: {
      address: '0xcb7322da63051cd4340424038f7e6d0e419cce85',
      abi: repliesABI,
      chainId: 10,
    },
    ChunkedERC721: {
      address: '0x6b5b7a69346dc9a82710c5de8428871d68376613',
      abi: chunkedERC721ABI,
      chainId: 10,
    },
  },
  137: {
    name: 'Polygon',
    explorer: 'https://polygonscan.com/',
    nativeCurrency: 'MATIC',
    replies: {
      address: '0x22f973bd80401b4bf2d9a71374d246519a78550c',
      abi: repliesABI,
      chainId: 137,
    },
    ChunkedERC721: {
      address: '0x8abd8d9fab3f711b16d15ce48747db49672eedb2',
      abi: chunkedERC721ABI,
      chainId: 137,
    },
  },
  80001: {
    name: 'Mumbai',
    explorer: 'https://mumbai.polygonscan.com/',
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
    explorer: 'https://goerli.etherscan.io/',
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
