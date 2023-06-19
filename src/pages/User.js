import { useNetwork } from 'wagmi';
import { useParams } from 'react-router-dom';

import { chainContracts } from '../contracts.js';
import { UserMessages } from '../components/MessageLoaders.js';

export function User() {
  const { chain } = useNetwork();
  const { address } = useParams();
  const contracts = chainContracts(chain);
  return (<div id="user">
    <p>Account {address}</p>
    <UserMessages address={address} contract={contracts.messages} />
  </div>);
}
