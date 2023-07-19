import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useContractReads } from 'wagmi';

import { byChain, chainContracts } from '../contracts.js';
import { SortSaver } from '../components/SortSaver.js';
import { RootTokenList } from '../components/RootTokenList.js';
import {InboxContext} from '../components/Layout.js';

const POST_PER_PAGE = 10;
export const NOTIFICATION_LOCALSTORAGE_KEY = 'lastSeenNotificationCount';

export function Inbox() {
  const { address } = useParams();
  return (<div id="inbox">
    <p>Inbox {address}</p>
    <p><Link to={`/u/${address}`}>Account Profile</Link></p>
    {Object.keys(byChain).map(x => (
      <SortSaver chainId={x}>
        <PerChain key={x} contracts={chainContracts(x)} {...{address}} />
      </SortSaver>
    ))}
  </div>);
}

function PerChain({ contracts, address }) {
  const [ , setInboxData ] = useContext(InboxContext);
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
    const chainId = contracts.replies.chainId;
    const curData = JSON.parse(localStorage.getItem(NOTIFICATION_LOCALSTORAGE_KEY) || '{}');
    if(!(address in curData)) curData[address] = {};
    if((!(chainId in curData[address])) || (newVal > curData[address][chainId])) {
      curData[address][chainId] = newVal;
      setInboxData(curData);
      localStorage.setItem(NOTIFICATION_LOCALSTORAGE_KEY, JSON.stringify(curData));
    }
  }, [data]);
  if(isLoading) return (
    <div>Loading notifications...</div>
  );
  else if(isError) return (
    <div>Error loading notifications!</div>
  );
  else if(data) return (<div id="user">
    <h2>Notifications on {contracts.name}</h2>
    <p>Count: {data[0].result.toString()}</p>
    <LoadPage {...{contracts, address}} start={0} perPage={POST_PER_PAGE} count={Number(data[0].result.toString())} />
  </div>);
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
    <LoadFromInternal {...{contracts}} list={data.map(item => item.result[1])} />
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
