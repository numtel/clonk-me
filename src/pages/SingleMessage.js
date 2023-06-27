import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import { chainContracts } from '../contracts.js';
import { LoadMessages } from '../components/MessageLoaders.js';
import { ChainContext } from '../components/Layout.js';

export function SingleMessage() {
  const { chainId } = useContext(ChainContext);
  const { address } = useParams();
  const contracts = chainContracts(chainId);
  return (<div id="single">
    <LoadMessages addresses={[address]} contract={contracts.messages} />
  </div>);
}

