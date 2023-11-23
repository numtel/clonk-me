import {useContext} from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import {DefaultChainContext} from '../Router.js';
import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';
import { chainContracts, ChainList } from '../contracts.js';

export function Home() {
  const { chainId: curChain } = useParams();
  const [, setDefaultChain] = useContext(DefaultChainContext);
  setDefaultChain(curChain);

  const chainId = Number(curChain);
  const contracts = chainContracts(chainId);

  return (<div id="token">
    <Helmet>
      <title>Clonk.me</title>
    </Helmet>
    <ul className="chains tabs">
      <ChainList>
        <ChainTab {...{curChain}} />
      </ChainList>
    </ul>
    {contracts ? (<>
      <SortSaver {...{chainId}}>
        <RootTokenList {...{chainId}} maxWords={9999999999} tokens={[{collection: contracts.ChunkedERC721.address, tokenId: contracts.home}]} />
      </SortSaver>
    </>) : (<>
      <p>Invalid chain!</p>
    </>)}
  </div>);
}

function ChainTab({ chainId, chain, curChain }) {
  return (
    <li className={`${curChain === chainId ? 'active' : ''}`}><Link to={`/home/${chainId}`}><button>{chain.name}</button></Link></li>
  );
}
