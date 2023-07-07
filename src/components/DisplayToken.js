import { erc721ABI, useContractReads } from 'wagmi';
import { Link } from 'react-router-dom';

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

export function DisplayToken({ chainId, collection, tokenId, tokenURI, owner, unsortedCount, sortedCount, replyAddedTime }) {
  return (
    <div className="msg">
      <UserBadge address={owner} />
      {replyAddedTime && replyAddedTime > 0 && (
        <span className="postdate"> posted <Link to={`/nft/${chainId}/${collection}/${tokenId}`}>{remaining(Math.round(Date.now() / 1000) - replyAddedTime.toString(), true)} ago</Link></span>
      )}
      <iframe title="NFT display" src={tokenURI}></iframe>
      <Replies {...{chainId, collection, tokenId, owner, unsortedCount, sortedCount}} />
    </div>
  );
}

export function remaining(seconds, onlyFirst) {
  const units = [
    { value: 1, unit: 'second' },
    { value: 60, unit: 'minute' },
    { value: 60 * 60, unit: 'hour' },
    { value: 60 * 60 * 24, unit: 'day' },
  ];
  let remaining = Number(seconds);
  let out = [];
  for(let i = units.length - 1; i >= 0;  i--) {
    if(remaining >= units[i].value) {
      const count = Math.floor(remaining / units[i].value);
      out.push(count.toString(10) + ' ' + units[i].unit + (count !== 1 ? 's' : ''));
      if(onlyFirst) return out[0];
      remaining = remaining - (count * units[i].value);
    }
  }
  return out.join(', ');
}
