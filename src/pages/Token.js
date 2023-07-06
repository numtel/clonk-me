import { useParams } from 'react-router-dom';

import { chainContracts } from '../contracts.js';
import { DisplayTokens } from '../components/DisplayToken.js';

export function Token() {
  // TODO validate these values
  const { chainId, collection, tokenId } = useParams();
  const contracts = chainContracts(chainId);
  return (<div id="token">
    <p>Token {chainId} {collection} {tokenId}</p>
    <DisplayTokens {...{chainId}} tokens={[{collection, tokenId}]} />
  </div>);
}
