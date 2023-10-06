import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useContractReads, useAccount } from 'wagmi';

import { byChain } from '../contracts.js';

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
  if(!address) return null;
  if(isLoading) return (
    <Link
      to={`/u/${address}/inbox`}
      className={`notifications loading`}
      title={'Loading Notifications Status...'}>
      <span className="material-symbols-outlined">
        mail
      </span>
    </Link>
  );
  else if(isError) return (
    <Link
      to={`/u/${address}/inbox`}
      className={`notifications error`}
      title={'Error Loading Notifications'}>
      <span className="material-symbols-outlined">
        mail
      </span>
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
        <span className="material-symbols-outlined">
          mail
        </span>
      </Link>
    )
  }
}
