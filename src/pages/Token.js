import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';
import { useContractReads, erc721ABI } from 'wagmi';

export function Token() {
  // TODO validate these values
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

  return (<div id="token">
    <Helmet>
      <title>
        {isLoading ? 'Loading NFT...' :
          isError ? 'Error!' :
          data ? `${data[0].result} #${tokenId}` : 'Unknown Error!'}
      </title>
    </Helmet>
    <SortSaver {...{chainId}}>
      <RootTokenList {...{chainId}} tokens={[{collection, tokenId}]} />
    </SortSaver>
  </div>);
}
