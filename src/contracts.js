export const defaultChain = 80001;

const byChain = {
  80001: {
    factory: '0x07c391096511c7f004de0b92ccf303658003d3dd',
    root: '0x56eaf6e52e43965fb32c8f711cc45ac610758b41',
  },
};

export const msgProps = [
  'message', 'createdAt', 'lastChanged', 'owner',
  'parent', 'sortedCount', 'unsortedCount',
];


export function chainContracts(chain) {
  if(chain && (chain.id in byChain || chain in byChain)) return byChain[chain.id || chain];
  else return byChain[defaultChain];
}

