import { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContractReads, useAccount } from 'wagmi';

import { byChain } from '../contracts.js';

import {InboxContext} from './Layout.js';

const WATCH_INTERVAL = 60_000;

export function InboxButton() {
  const { address } = useAccount();
  const [ inboxData ] = useContext(InboxContext);
  const toLoad = Object.keys(byChain).map(x => ({
    ...byChain[x].replies,
    functionName: 'notificationCount',
    args: [address],
  }));
  const { data, isError, isLoading, refetch } = useContractReads({
    contracts: toLoad,
  });
  useEffect(() => {
    const interval = setInterval(refetch, WATCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);
  if(!address) return null;
  if(isLoading) return (
    <Link
      to={`/u/${address}/inbox`}
      className={`notifications loading`}
      title={'Loading Notifications Status...'}>
      <button type="button" className="rk">
        <span className="material-symbols-outlined">
          mail
        </span>
      </button>
    </Link>
  );
  else if(isError) return (
    <Link
      to={`/u/${address}/inbox`}
      className={`notifications error`}
      title={'Error Loading Notifications'}>
      <button type="button" className="rk">
        <span className="material-symbols-outlined">
          mail
        </span>
      </button>
    </Link>
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
        className={`notifications ${hasNew ? 'new' : ''}`}
        title={hasNew ? 'Unread Notifications' : 'No unread notifications'}>
        <button type="button" className="rk">
          <span className="material-symbols-outlined">
            mail
          </span>
        </button>
      </Link>
    )
  }
}
