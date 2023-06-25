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
    <UserMessages address={address} pageSize={30} contract={contracts.messages} />
  </div>);
}
