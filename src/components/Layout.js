import { createContext, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, Link, useLocation } from "react-router-dom";

import {InboxButton} from './InboxButton.js';
import {CreateButton} from './CreateButton.js';
import {SettingsButton, CHAINS_DISABLED_LOCALSTORAGE_KEY, MIMES_ENABLED_LOCALSTORAGE_KEY, DEFAULT_CHAIN_LOCALSTORAGE_KEY} from './SettingsButton.js';
import {NOTIFICATION_LOCALSTORAGE_KEY} from '../pages/Inbox.js';

export const InboxContext = createContext(null);
export const ChainsDisabledContext = createContext(null);
export const MimesEnabledContext = createContext(null);

export function Layout() {
  // New chains added are opt-out
  const [chainsDisabled, setChainsDisabled] = useState(JSON.parse(localStorage.getItem(CHAINS_DISABLED_LOCALSTORAGE_KEY) || '[]'));
  // New MIMEs are opt-in
  const [mimesEnabled, setMimesEnabled] = useState(JSON.parse(localStorage.getItem(MIMES_ENABLED_LOCALSTORAGE_KEY) || '[]'));

  const inboxState = useState(JSON.parse(localStorage.getItem(NOTIFICATION_LOCALSTORAGE_KEY) || '{}'));
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  return (<>
    <InboxContext.Provider value={inboxState}>
    <ChainsDisabledContext.Provider value={chainsDisabled}>
    <MimesEnabledContext.Provider value={mimesEnabled}>
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
          <SettingsButton {...{mimesEnabled, setMimesEnabled, chainsDisabled, setChainsDisabled}} />
          <InboxButton />
          <CreateButton />
        </div>
      </header>
      <Outlet />
    </MimesEnabledContext.Provider>
    </ChainsDisabledContext.Provider>
    </InboxContext.Provider>
  </>);
}
