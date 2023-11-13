import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';
import { byChain, chainContracts } from '../contracts.js';

export function Home() {
  const { chainId: curChain } = useParams();
  const chainId = Number(curChain);
  const contracts = chainContracts(chainId);

  return (<div id="token">
    <Helmet>
      <title>Clonk.me</title>
    </Helmet>
    <ul className="chains tabs">
      {Object.keys(byChain).map(x => (
        <li className={`${Number(x) === chainId ? 'active' : ''}`}><Link to={`/home/${x}`}><button>{byChain[x].name}</button></Link></li>
      ))}
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
