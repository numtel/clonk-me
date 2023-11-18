import { createContext, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, Link, useLocation } from "react-router-dom";

import {InboxButton} from './InboxButton.js';
import {CreateButton} from './CreateButton.js';
import {SettingsButton, CHAINS_DISABLED_LOCALSTORAGE_KEY, MIMES_ENABLED_LOCALSTORAGE_KEY} from './SettingsButton.js';
import {NOTIFICATION_LOCALSTORAGE_KEY} from '../pages/Inbox.js';
import useFetchJson from './useFetchJson.js';

export const InboxContext = createContext(null);
export const ChainsDisabledContext = createContext(null);
export const MimesEnabledContext = createContext(null);
export const BlockedContext = createContext(null);

export function Layout() {
  // New chains added are opt-out
  const [chainsDisabled, setChainsDisabled] = useState(JSON.parse(localStorage.getItem(CHAINS_DISABLED_LOCALSTORAGE_KEY) || '[]'));
  // New MIMEs are opt-in
  const [mimesEnabled, setMimesEnabled] = useState(JSON.parse(localStorage.getItem(MIMES_ENABLED_LOCALSTORAGE_KEY) || '[]'));

  const inboxState = useState(JSON.parse(localStorage.getItem(NOTIFICATION_LOCALSTORAGE_KEY) || '{}'));
  const { data: blockData } = useFetchJson('https://config.clonk.me/blocked.json');
  const location = useLocation();
  const path = location.pathname.toLowerCase();
  return (<>
    <BlockedContext.Provider value={blockData}>
    <InboxContext.Provider value={inboxState}>
    <ChainsDisabledContext.Provider value={chainsDisabled}>
    <MimesEnabledContext.Provider value={mimesEnabled}>
      <header>
        <div className="left-side">
          <Link to="/"><h1>clonk.me</h1></Link>
          <nav>
            <ul>
              <li key="1"><Link className={path.startsWith('/home') ? 'active' : ''} to="/home">Home</Link></li>
              <li key="2"><Link className={path.startsWith('/latest') ? 'active' : ''} to="/latest">Latest Posts</Link></li>
            </ul>
          </nav>
        </div>
        <div className="account">
          <ConnectButton />
          <div className="controls">
            <InboxButton />
            <CreateButton />
            <SettingsButton {...{mimesEnabled, setMimesEnabled, chainsDisabled, setChainsDisabled}} />
          </div>
        </div>
      </header>
      <Outlet />
    </MimesEnabledContext.Provider>
    </ChainsDisabledContext.Provider>
    </InboxContext.Provider>
    </BlockedContext.Provider>
  </>);
}
