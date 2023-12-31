import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractReads } from 'wagmi';
import { Helmet } from 'react-helmet';

import {DefaultChainContext} from '../Router.js';
import { byChain, chainContracts, ChainList } from '../contracts.js';
import { RootTokenList } from '../components/RootTokenList.js';
import { SortSaver } from '../components/SortSaver.js';
import UserBadge from '../components/UserBadge.js';

const POST_PER_PAGE = 10;

export function User() {
  const { address, chainId: curChain } = useParams();
  const [ counts, setCounts] = useState({});
  const [, setDefaultChain] = useContext(DefaultChainContext);
  setDefaultChain(curChain);

  const contracts = chainContracts(curChain);

  return (<div id="user">
    <Helmet>
      <title>User Profile {address} on {byChain[curChain].name}</title>
    </Helmet>
    <h2>Account: <UserBadge {...{address, curChain}} />
      <Link target="_blank" rel="noreferrer" to={`${contracts.explorer}address/${address}`} title="View on Explorer" className="external">
        <span className="material-symbols-outlined">
          open_in_new
        </span>
      </Link>
    </h2>
    <ul className="tabs">
      <li className="active"><button type="button">Posts</button></li>
      <li><Link to={`/u/${address}/inbox/${curChain}`}><button type="button">Inbox</button></Link></li>
    </ul>
    <ul className="chains tabs">
      <ChainList>
        <PerChain {...{address, curChain, setCounts}} />
      </ChainList>
    </ul>
    {curChain && (
      <SortSaver {...{chainId: curChain}}>
        <LoadPage {...{contracts: chainContracts(curChain), address}} start={0} perPage={POST_PER_PAGE} count={Number(counts[curChain] || 0)} />
      </SortSaver>
    )}
  </div>);
}

function PerChain({ chainId, chain, address, curChain, setCounts }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...chain.ChunkedERC721,
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
  return (
    <li className={`${chainId === curChain ? 'active' : ''}`}><Link to={`/u/${address}/${chainId}`}><button>{chain.name}</button></Link></li>
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
