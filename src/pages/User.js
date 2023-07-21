import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractReads } from 'wagmi';

import { byChain, chainContracts } from '../contracts.js';
import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';
import UserBadge from '../components/UserBadge.js';

const POST_PER_PAGE = 10;

export function User() {
  const { address } = useParams();
  const [ curChain, setCurChain] = useState(Object.keys(byChain)[0]);
  const [ counts, setCounts] = useState({});

  return (<div id="user">
    <h2>Account: <UserBadge {...{address}} /></h2>
    <ul className="tabs">
      <li className="active">Posts</li>
      <li><Link to={`/u/${address}/inbox`}>Inbox</Link></li>
    </ul>
    <ul className="chains tabs">
      {Object.keys(byChain).map(x => (
        <PerChain key={x} contracts={chainContracts(x)} {...{address, curChain, setCurChain, setCounts}} />
      ))}
    </ul>
    {curChain && (
      <SortSaver {...{chainId: curChain}}>
        <LoadPage {...{contracts: chainContracts(curChain), address}} start={0} perPage={POST_PER_PAGE} count={Number(counts[curChain] || 0)} />
      </SortSaver>
    )}
  </div>);
}

function PerChain({ contracts, address, curChain, setCurChain, setCounts }) {
  const chainId = contracts.replies.chainId;
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...contracts.ChunkedERC721,
        functionName: 'balanceOf',
        args: [address],
      }
    ],
  });
  useEffect(() => {
    if(data) {
      setCounts(counts => {
        counts[chainId] = data[0].result;
        return {...counts};
      });
    }
  }, [data]);
  if(isLoading) return (
    <div>Loading posts...</div>
  );
  else if(isError) return (
    <div>Error loading posts!</div>
  );
  else if(data) return (
    <li className={`${chainId === Number(curChain) ? 'active' : ''}`}><button onClick={() => setCurChain(chainId)}>{contracts.name}</button></li>
  );
}

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
