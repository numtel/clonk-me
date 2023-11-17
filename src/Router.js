import React, {createContext, useState} from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { LatestPosts } from './pages/LatestPosts.js';
import { User } from './pages/User.js';
import { Token } from './pages/Token.js';
import { Inbox } from './pages/Inbox.js';
import { defaultChain } from './contracts.js';
import {DEFAULT_CHAIN_LOCALSTORAGE_KEY} from './components/SettingsButton.js';

export const DefaultChainContext = createContext(null);

export function Router() {
  const defaultChainState = useState(localStorage.getItem(DEFAULT_CHAIN_LOCALSTORAGE_KEY) || defaultChain);
  const myDefaultChain = defaultChainState[0];
  return (
    <DefaultChainContext.Provider value={defaultChainState}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index
            element={<Navigate to={`/home/${myDefaultChain}`} />}
          />
          <Route
            path="home/"
            element={<Navigate to={`/home/${myDefaultChain}`} />}
          />
          <Route
            path="home/:chainId"
            element={<Home />}
          />
          <Route
            path="latest/"
            element={<Navigate to={`/latest/${myDefaultChain}`} />}
          />
          <Route
            path="latest/:chainId"
            element={<LatestPosts />}
          />
          <Route
            path="u/:address"
            element={<UserProfileRoot {...{myDefaultChain}} />}
          />
          <Route
            path="u/:address/:chainId"
            element={<User />}
          />
          <Route
            path="u/:address/inbox"
            element={<InboxRoot {...{myDefaultChain}} />}
          />
          <Route
            path="u/:address/inbox/:chainId"
            element={<Inbox />}
          />
          <Route
            path="nft/:chainId/:collection/:tokenId"
            element={<Token />}
          />
          <Route path="*" element={<>nomatch</>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </DefaultChainContext.Provider>
  );
}

function UserProfileRoot({myDefaultChain}) {
  const { address } = useParams();
  return (<Navigate to={`/u/${address}/${myDefaultChain}`} />)
}

function InboxRoot({myDefaultChain}) {
  const { address } = useParams();
  return (<Navigate to={`/u/${address}/inbox/${myDefaultChain}`} />)
}
