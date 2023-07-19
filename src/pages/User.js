import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractReads } from 'wagmi';

import { byChain, chainContracts } from '../contracts.js';
import { RootTokenList } from '../components/RootTokenList.js';

const POST_PER_PAGE = 10;

export function User() {
  const { address } = useParams();

  return (<div id="user">
    <p>Account {address}</p>
    <p><Link to={`/u/${address}/inbox`}>Notifications Inbox</Link></p>
    {Object.keys(byChain).map(x => (
      <PerChain key={x} contracts={chainContracts(x)} {...{address}} />
    ))}
  </div>);
}

function PerChain({ contracts, address }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...contracts.ChunkedERC721,
        functionName: 'balanceOf',
        args: [address],
      }
    ],
  });
  if(isLoading) return (
    <div>Loading posts...</div>
  );
  else if(isError) return (
    <div>Error loading posts!</div>
  );
  else if(data) return (<div id="user">
    <h2>Posts on {contracts.name}</h2>
    <p>Count: {data[0].result.toString()}</p>
    <LoadPage {...{contracts, address}} start={0} perPage={POST_PER_PAGE} count={Number(data[0].result.toString())} />
  </div>);
}

// TODO can't have multiple RootTokenList due to the sort
function LoadPage({ contracts, address, count, start, perPage }) {
  const [loadMore, setLoadMore] = useState(false);
  const toLoad = [];
  const hasMore = start + perPage <= count;
  for(let i = 0; i < perPage; i++) {
    if(start + i >= count) break;
    toLoad.push({
      ...contracts.ChunkedERC721,
      functionName: 'tokenOfOwnerByIndex',
      args: [address, count - 1 - (start + i)],
    });
  }
  const { data, isError, isLoading } = useContractReads({
    contracts: toLoad,
  });
  if(isLoading) return (
    <div>Loading posts...</div>
  );
  else if(isError) return (
    <div>Error loading posts!</div>
  );
  else if(data) return(<>
    <RootTokenList
      chainId={contracts.ChunkedERC721.chainId}
      tokens={data.map(res => ({
        collection: contracts.ChunkedERC721.address,
        tokenId: res.result
      }))}
    />
    {hasMore ? loadMore ?
      <LoadPage
        {...{contracts, address, count, perPage}}
        start={start + perPage}
      />
     : <button onClick={() => setLoadMore(true)}>Load more...</button> : null}
  </>);
}
