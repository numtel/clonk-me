import { useNetwork } from 'wagmi';
import { Link } from 'react-router-dom';

import { chainContracts, defaultChain } from '../contracts.js';

import { LoadMessages } from '../components/MessageLoaders.js';

export function Home() {
  const { chain } = useNetwork();
  const contracts = chainContracts(chain);
  return (<>
    <Link to="/about">Team</Link>
    <LoadMessages addresses={[contracts.root]} chainId={chain ? chain.id : defaultChain} />
  </>);
}
