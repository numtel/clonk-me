export const defaultChain = 80001;

const byChain = {
  137: { // polygon
    factory: '0x5cdee46668df5c3a35126f68478f745f6403557c',
    root: '0xCf0437F44F9150B288b49778E5360f0Dc743C636',
  },
  80001: { // mumbai
    factory: '0x4a7bb8b0b2950ef6cd9cdb374eeae740463d2157',
    root: '0xf5ea5fcdc718b8b99ae98df3c92ab1937d8c1a99',
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

