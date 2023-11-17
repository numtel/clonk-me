import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractReads } from 'wagmi';
import { Helmet } from 'react-helmet';

import { byChain, chainContracts, ChainList } from '../contracts.js';
import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';

const POST_PER_PAGE = 10;

export function LatestPosts() {
  const { chainId: curChain } = useParams();
  const [ counts, setCounts] = useState({});

  return (<div id="latest">
    <Helmet>
      <title>{byChain[curChain].name} Latest Posts</title>
    </Helmet>
    <p>Post replies on any NFT! As an NFT holder, sort and moderate the replies you receive.</p>
    <h2>Latest Posts</h2>
    <ul className="chains tabs">
      <ChainList>
        <PerChain {...{curChain, setCounts}} />
      </ChainList>
    </ul>
    {curChain && (
      <SortSaver {...{chainId: curChain}}>
        <LoadPage {...{contracts: chainContracts(curChain)}} start={0} perPage={POST_PER_PAGE} count={Number(counts[curChain] || 0)} />
      </SortSaver>
    )}
  </div>);
}

function PerChain({ chainId, chain, curChain, setCounts }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...chain.ChunkedERC721,
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
  return (
    <li className={`${chainId === curChain ? 'active' : ''}`}><Link to={`/latest/${chainId}`}><button>{chain.name}</button></Link></li>
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

