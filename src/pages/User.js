import { useNetwork } from 'wagmi';
import { useParams } from 'react-router-dom';

import { defaultChain } from '../contracts.js';
import { UserMessages } from '../components/MessageLoaders.js';

export default function User() {
  const { chain } = useNetwork();
  const { address } = useParams();
  return (<div id="user">
    <p>Account {address}</p>
    <UserMessages address={address} chainId={chain ? chain.id : defaultChain} />
  </div>);
}
