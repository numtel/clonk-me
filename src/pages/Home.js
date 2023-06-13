import { useNetwork } from 'wagmi';
import { Link } from 'react-router-dom';

import { chainContracts, defaultChain } from '../contracts.js';

import { LoadMessages } from '../components/MessageLoaders.js';

export function Home() {
  const { chain } = useNetwork();
  const contracts = chainContracts(chain);
  return (<>
    <p>Welcome to the website! You are the moderator of your own posts. You control the discussion by choosing how to sort the replies to your messages.</p>
    <LoadMessages addresses={[contracts.root]} chainId={chain ? chain.id : defaultChain} />
  </>);
}
