import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractReads } from 'wagmi';
import { Helmet } from 'react-helmet';

import { byChain, chainContracts } from '../contracts.js';
import { SortSaver } from '../components/SortSaver.js';
import { RootTokenList } from '../components/RootTokenList.js';
import {InboxContext} from '../components/Layout.js';
import UserBadge from '../components/UserBadge.js';

const POST_PER_PAGE = 10;
export const NOTIFICATION_LOCALSTORAGE_KEY = 'lastSeenNotificationCount';

export function Inbox() {
  const [ inboxData ] = useContext(InboxContext);
  const { address, chainId: curChain } = useParams();
  return (<div id="inbox">
    <Helmet>
      <title>Inbox {address} on {byChain[curChain].name}</title>
    </Helmet>
    <h2>Account: <UserBadge {...{address, curChain}} />
      <Link target="_blank" rel="noreferrer" to={`${byChain[curChain].explorer}address/${address}`} title="View on Explorer" className="external">
        <span class="material-symbols-outlined">
          open_in_new
        </span>
      </Link>
    </h2>
    <ul className="tabs">
      <li><Link to={`/u/${address}/${curChain}`}>Posts</Link></li>
      <li className="active">Inbox</li>
    </ul>
    <ul className="chains tabs">
      {Object.keys(byChain).map((x, index) => (
        <PerChain key={x} contracts={chainContracts(x)} {...{address, index, curChain}} />
      ))}
    </ul>
    {curChain && (
      <SortSaver {...{chainId: curChain}}>
        <LoadPage {...{contracts: chainContracts(curChain), address}} start={0} perPage={POST_PER_PAGE} count={Number(address in inboxData ? inboxData[address][curChain] : 0)} />
      </SortSaver>
    )}
  </div>);
}

function PerChain({ contracts, address, index, curChain, setArticle }) {
  const [ inboxData, setInboxData ] = useContext(InboxContext);
  const chainId = contracts.replies.chainId;
  const [curVal] = useState(address in inboxData ? inboxData[address][chainId] : 0);
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        ...contracts.replies,
        functionName: 'notificationCount',
        args: [address],
      }
    ],
  });
  useEffect(() => {
    if(!data || !data[0].result) return;
    const newVal = Number(data[0].result.toString());
    const curData = JSON.parse(localStorage.getItem(NOTIFICATION_LOCALSTORAGE_KEY) || '{}');
    if(!(address in curData)) curData[address] = {};
    if((!(chainId in curData[address])) || (newVal > curData[address][chainId])) {
      curData[address][chainId] = newVal;
      setInboxData(curData);
      localStorage.setItem(NOTIFICATION_LOCALSTORAGE_KEY, JSON.stringify(curData));
    }
  }, [data]);
  return (<>
    <li className={`${chainId === Number(curChain) ? 'active' : ''} ${data && (data[0].result > curVal) ? 'new' : ''}`}><Link to={`/u/${address}/inbox/${chainId}`}><button>{contracts.name}</button></Link></li>
  </>);
}

function LoadPage({ contracts, address, count, start, perPage }) {
  const [loadMore, setLoadMore] = useState(false);
  const toLoad = [];
  const hasMore = start + perPage <= count;
  for(let i = 0; i < perPage; i++) {
    if(start + i >= count) break;
    toLoad.push({
      ...contracts.replies,
      functionName: 'notifications',
      args: [address, count - 1 - (start + i)],
    });
  }
  const { data, isError, isLoading } = useContractReads({
    contracts: toLoad,
  });
  if(isLoading) return (
    <div>Loading notifications...</div>
  );
  else if(isError) return (
    <div>Error loading notifications!</div>
  );
  // TODO how to display to which parent this reply goes
  else if(data) return(<>
    <LoadFromInternal {...{contracts}} list={data.map(item => item.result && item.result[1])} />
    {hasMore ? loadMore ?
      <LoadPage
        {...{contracts, address, count, perPage}}
        start={start + perPage}
      />
     : <button onClick={() => setLoadMore(true)}>Load more...</button> : null}
  </>);
}

function LoadFromInternal({contracts, list}) {
  const toLoad = [];
  for(let i = 0; i < list.length; i++) {
    toLoad.push({
      ...contracts.replies,
      functionName: 'reverseInternalAddr',
      args: [list[i]],
    });
  }
  const { data, isError, isLoading } = useContractReads({
    contracts: toLoad,
  });
  if(isLoading) return (
    <div>Loading notifications...</div>
  );
  else if(isError) return (
    <div>Error loading notifications!</div>
  );
  else if (data) {
    return (
      <RootTokenList
        chainId={contracts.ChunkedERC721.chainId}
        tokens={data.map(res => ({
          collection: res.result[0],
          tokenId: res.result[1],
        }))}
      />
    );
  }
}
