import { erc721ABI, useContractReads } from 'wagmi';

import { chainContracts } from '../contracts.js';
import UserBadge from './UserBadge.js';
import { Replies } from './Replies.js';

const removeSortVal = 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffn;

export function DisplayTokens({ chainId, tokens }) {
  const contracts = chainContracts(chainId);
  const { data, isError, isLoading } = useContractReads({
    contracts: tokens.map(token => [
      {
        chainId,
        address: token.collection,
        abi: erc721ABI,
        functionName: 'tokenURI',
        args: [token.tokenId],
      },
      {
        chainId,
        address: token.collection,
        abi: erc721ABI,
        functionName: 'ownerOf',
        args: [token.tokenId],
      },
      {
        ...contracts.replies,
        functionName: 'unsortedCount',
        args: [token.collection, token.tokenId],
      },
      {
        ...contracts.replies,
        functionName: 'sortedCount',
        args: [token.collection, token.tokenId],
      },
    ]).flat(),
  });
  if(isLoading) return (
    <div>Loading token details...</div>
  );
  else if(isError) return (
    <div>Error loading token!</div>
  );
  else if(data) return tokens.map((token, index) => (
    <DisplayToken
      {...{chainId}}
      key={`${token.collection}-${token.tokenId}`}
      collection={token.collection}
      tokenId={token.tokenId}
      tokenURI={data[index * 4].result}
      owner={data[index * 4 + 1].result}
      unsortedCount={data[index * 4 + 2].result}
      sortedCount={data[index * 4 + 3].result}
    />
  ));
}

export function DisplayToken({ chainId, collection, tokenId, tokenURI, owner, unsortedCount, sortedCount }) {
  return (
    <div className="msg">
      <UserBadge address={owner} />
      <iframe title="NFT display" src={tokenURI}></iframe>
      <Replies {...{chainId, collection, tokenId, owner, unsortedCount, sortedCount}} />
    </div>
  );
}
