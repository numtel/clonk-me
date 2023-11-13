import { createContext, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, Link, useLocation } from "react-router-dom";

import {InboxButton} from './InboxButton.js';
import {CreateButton} from './CreateButton.js';
import {NOTIFICATION_LOCALSTORAGE_KEY} from '../pages/Inbox.js';

export const InboxContext = createContext(null);

export function Layout() {
  const inboxState = useState(JSON.parse(localStorage.getItem(NOTIFICATION_LOCALSTORAGE_KEY) || '{}'));
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  return (<>
    <InboxContext.Provider value={inboxState}>
      <header>
        <Link to="/"><h1>clonk.me</h1></Link>
        <nav>
          <ul>
            <li key="1"><Link className={path.startsWith('/home') ? 'active' : ''} to="/home">Home</Link></li>
            <li key="2"><Link className={path.startsWith('/latest') ? 'active' : ''} to="/latest">Latest Posts</Link></li>
          </ul>
        </nav>
        <div className="account">
          <ConnectButton />
          <InboxButton />
          <CreateButton />
        </div>
      </header>
      <Outlet />
    </InboxContext.Provider>
  </>);
}
