import { createContext, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, Link } from "react-router-dom";

import {InboxButton} from './InboxButton.js';
import {NOTIFICATION_LOCALSTORAGE_KEY} from '../pages/Inbox.js';

export const InboxContext = createContext(null);

// TODO button to add new post without a parent
export function Layout() {
  const inboxState = useState(JSON.parse(localStorage.getItem(NOTIFICATION_LOCALSTORAGE_KEY) || '{}'));
  return (<>
    <InboxContext.Provider value={inboxState}>
      <header>
        <Link to="/"><h1>clonk.me</h1></Link>
        <div className="account">
          <ConnectButton />
          <InboxButton />
        </div>
      </header>
      <Outlet />
    </InboxContext.Provider>
  </>);
}
