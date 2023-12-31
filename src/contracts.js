import React, {useContext} from 'react';
import { encodePacked, keccak256 } from 'viem';

import repliesABI from './abi/NFTReplies.json';
import chunkedERC721ABI from './abi/ChunkedERC721.json';
import verificationABI from './abi/Verification.json';

import {EditChunkedERC721} from './components/EditChunkedERC721.js';
import {ChainsDisabledContext} from './components/Layout.js';

export const defaultChain = 137;

export const byChain = {
  10: {
    name: 'Optimism',
    home: 1,
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
    Verification: {
      address: '0x247baae25D0c32fdA5CfB902c0d87D47587CF9Da',
      abi: verificationABI,
      chainId: 10,
    },
  },
  137: {
    name: 'Polygon',
    home: 1,
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
    Verification: {
      address: '0x637aeabc614e95da58f232e493fca63d09e15b8f',
      abi: verificationABI,
      chainId: 137,
    },
  },
  80001: {
    name: 'Mumbai',
    home: 1,
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
    home: 1,
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
  17000: {
    name: 'Holesky',
    home: 1,
    explorer: 'https://holesky.etherscan.io/',
    nativeCurrency: 'hETH',
    replies: {
      address: '0xdb896cd12babfec15ec4bfface8c0ee7887fbd71',
      abi: repliesABI,
      chainId: 17000,
    },
    ChunkedERC721: {
      address: '0x8f2448ba4b30c394ab9fd7835fb1f0fe1a3734e0',
      abi: chunkedERC721ABI,
      chainId: 17000,
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

export function ChainList({children}) {
  const chainsDisabled = useContext(ChainsDisabledContext);
  return (<>
    {Object.keys(byChain)
      .filter(chainId => !chainsDisabled.includes(chainId))
      .map((chainId, index) =>
        React.cloneElement(children, {
          key: index,
          chainId,
          chain: byChain[chainId]
        })
      )
    }
  </>);
}
