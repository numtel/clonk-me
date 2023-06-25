import { useNetwork } from 'wagmi';

import { chainContracts } from '../contracts.js';

import { LoadMessages } from '../components/MessageLoaders.js';

export function Home() {
  const { chain } = useNetwork();
  const contracts = chainContracts(chain);
  return (<>
    <LoadMessages addresses={[contracts.root]} contract={contracts.messages} />
  </>);
}
