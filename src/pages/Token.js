import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useContractReads, erc721ABI } from 'wagmi';

import {DefaultChainContext} from '../Router.js';
import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';

export function Token() {
  const { chainId, collection, tokenId } = useParams();
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        chainId: Number(chainId),
        address: collection,
        abi: erc721ABI,
        functionName: 'name',
      }
    ],
  });
  const [, setDefaultChain] = useContext(DefaultChainContext);
  setDefaultChain(chainId);

  return (<div id="token">
    <Helmet>
      <title>
        {isLoading ? 'Loading NFT...' :
          isError ? 'Error!' :
          data ? `${data[0].result} #${tokenId}` : 'Unknown Error!'}
      </title>
    </Helmet>
    <SortSaver {...{chainId}}>
      <RootTokenList {...{chainId}} maxWords={9999999999} tokens={[{collection, tokenId}]} />
    </SortSaver>
  </div>);
}
