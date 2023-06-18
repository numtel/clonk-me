import { useNetwork } from 'wagmi';
import { useParams } from 'react-router-dom';

import { chainContracts } from '../contracts.js';
import { LoadMessages } from '../components/MessageLoaders.js';

export function SingleMessage() {
  const { chain } = useNetwork();
  const { address } = useParams();
  const contracts = chainContracts(chain);
  return (<div id="single">
    <LoadMessages addresses={[address]} contract={contracts.messages} />
  </div>);
}

