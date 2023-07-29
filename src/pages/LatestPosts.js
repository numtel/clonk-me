import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractReads } from 'wagmi';

import { byChain, chainContracts } from '../contracts.js';
import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';

const POST_PER_PAGE = 10;

export function LatestPosts() {
  const { chainId: curChain } = useParams();
  const [ counts, setCounts] = useState({});

  return (<div id="latest">
    <p>Post replies on any NFT! As an NFT holder, sort and moderate the replies you receive.</p>
    <h2>Latest Posts</h2>
    <ul className="chains tabs">
      {Object.keys(byChain).map(x => (
        <PerChain key={x} contracts={chainContracts(x)} {...{curChain, setCounts}} />
      ))}
    </ul>
    {curChain && (
      <SortSaver {...{chainId: curChain}}>
        <LoadPage {...{contracts: chainContracts(curChain)}} start={0} perPage={POST_PER_PAGE} count={Number(counts[curChain] || 0)} />
      </SortSaver>
    )}
  </div>);
}

function PerChain({ contracts, curChain, setCounts }) {
  const chainId = contracts.replies.chainId;
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...contracts.ChunkedERC721,
        functionName: 'tokenCount',
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
    <li className={`${chainId === Number(curChain) ? 'active' : ''}`}><Link to={`/latest/${chainId}`}><button>{contracts.name}</button></Link></li>
  );
}

function LoadPage({ contracts, count, start, perPage }) {
  const [loadMore, setLoadMore] = useState(false);
  const toLoad = [];
  const hasMore = start + perPage < count;
  for(let i = 0; i < perPage; i++) {
    if(start + i >= count) break;
    toLoad.push({
      collection: contracts.ChunkedERC721.address,
      tokenId: count - (start + i)
    });
  }
  return(<>
    <RootTokenList
      chainId={contracts.ChunkedERC721.chainId}
      tokens={toLoad}
    />
    {hasMore ? loadMore ?
      <LoadPage
        {...{contracts, count, perPage}}
        start={start + perPage}
      />
     : <button onClick={() => setLoadMore(true)}>Load more...</button> : null}
  </>);
}

