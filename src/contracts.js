import messagesABI from './abi/Messages.json';

export const defaultChain = 80001;

const byChain = {
  80001: { // mumbai
    messages: {
      address: '0x8c318bfa9884366664e349109f1206f9d56920a6',
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

