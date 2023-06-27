import React, { useContext } from 'react';

import { chainContracts } from '../contracts.js';

import { LoadMessages } from '../components/MessageLoaders.js';
import { ChainContext } from '../components/Layout.js';

export function Home() {
  const { chainId } = useContext(ChainContext);
  const contracts = chainContracts(chainId);
  return (<>
    <LoadMessages addresses={[contracts.root]} contract={contracts.messages} />
  </>);
}
