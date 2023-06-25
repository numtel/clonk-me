import messagesABI from './abi/Messages.json';

export const defaultChain = 137;

const byChain = {
  137: { // polygon
    messages: {
      address: '0xcfa3756d600dba87dcf300556fb5143ce5d388b1',
      abi: messagesABI,
      chainId: 137,
    },
    root: '0xd961512c485f01fb972ff25de42a3097aa661140',
  },
  80001: { // mumbai
    messages: {
      address: '0xa02E508f9D264bC9e73670038C955E9FC76a5C78',
      abi: messagesABI,
      chainId: 80001,
    },
    root: '0x696296b40866AeF2f07C4ee66eCE1e06bc6654c5',
  },
};


export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  else return byChain[defaultChain];
}

