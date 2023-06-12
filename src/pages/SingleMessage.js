import { useNetwork } from 'wagmi';
import { useParams } from 'react-router-dom';

import { defaultChain } from '../contracts.js';
import { LoadMessages } from '../components/MessageLoaders.js';

export function SingleMessage() {
  const { chain } = useNetwork();
  const { address } = useParams();
  return (<div id="single">
    <LoadMessages addresses={[address]} chainId={chain ? chain.id : defaultChain} />
  </div>);
}

