import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useContractReads, useAccount } from 'wagmi';

import { byChain } from '../contracts.js';

import {NOTIFICATION_LOCALSTORAGE_KEY} from '../pages/Inbox.js';
import {InboxContext} from './Layout.js';

export function InboxButton() {
  const { address } = useAccount();
  const [ inboxData ] = useContext(InboxContext);
  const toLoad = Object.keys(byChain).map(x => ({
    ...byChain[x].replies,
    functionName: 'notificationCount',
    args: [address],
    // TODO why not working?
    watch: true,
  }));
  const { data, isError, isLoading } = useContractReads({
    contracts: toLoad,
  });
  if(isLoading) return (
    <div>Loading notifications...</div>
  );
  else if(isError) return (
    <div>Error loading notifications!</div>
  );
  else if(data) {
    const chainKeys = Object.keys(byChain);
    let hasNew = false;
    for(let i=0; i<chainKeys.length; i++) {
      const curVal = address in inboxData ? inboxData[address][chainKeys[i]] : 0;
      if(data[i].result > curVal) {
        hasNew = true;
        break;
      }
    }
    return (
      <Link
        to={`/u/${address}/inbox`}
        className={`notifications ${hasNew ? 'new' : ''}`}>
        Inbox
      </Link>
    )
  }
}
