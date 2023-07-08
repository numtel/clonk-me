import messagesABI from './abi/Messages.json';
import repliesABI from './abi/Replies.json';

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
      address: '0x95752672818c960b3875e6223aea34a9a55b769f',
      abi: repliesABI,
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

