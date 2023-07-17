import { useParams } from 'react-router-dom';

import { RootTokenList } from '../components/RootTokenList.js';

export function Token() {
  // TODO validate these values
  const { chainId, collection, tokenId } = useParams();
  return (<div id="token">
    <p>Token {chainId} {collection} {tokenId}</p>
    <RootTokenList {...{chainId}} tokens={[{collection, tokenId}]} />
  </div>);
}
