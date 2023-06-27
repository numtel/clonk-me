import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import { chainContracts } from '../contracts.js';
import { UserMessages } from '../components/MessageLoaders.js';
import { ChainContext } from '../components/Layout.js';

export function User() {
  const { chainId } = useContext(ChainContext);
  const { address } = useParams();
  const contracts = chainContracts(chainId);
  return (<div id="user">
    <p>Account {address}</p>
    <UserMessages address={address} pageSize={30} contract={contracts.messages} chainId={chainId} />
  </div>);
}
