import { useParams } from 'react-router-dom';

import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';

export function Token() {
  // TODO validate these values
  const { chainId, collection, tokenId } = useParams();
  return (<div id="token">
    <p>Token {chainId} {collection} {tokenId}</p>
    <SortSaver {...{chainId}}>
      <RootTokenList {...{chainId}} tokens={[{collection, tokenId}]} />
    </SortSaver>
  </div>);
}
