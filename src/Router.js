import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { LatestPosts } from './pages/LatestPosts.js';
import { User } from './pages/User.js';
import { Token } from './pages/Token.js';
import { Inbox } from './pages/Inbox.js';
import { defaultChain } from './contracts.js';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index
            element={<Navigate to={`/home/${defaultChain}`} />}
          />
          <Route
            path="home/"
            element={<Navigate to={`/home/${defaultChain}`} />}
          />
          <Route
            path="home/:chainId"
            element={<Home />}
          />
          <Route
            path="latest/"
            element={<Navigate to={`/latest/${defaultChain}`} />}
          />
          <Route
            path="latest/:chainId"
            element={<LatestPosts />}
          />
          <Route
            path="u/:address"
            element={<UserProfileRoot />}
          />
          <Route
            path="u/:address/:chainId"
            element={<User />}
          />
          <Route
            path="u/:address/inbox"
            element={<InboxRoot />}
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
  );
}

function UserProfileRoot() {
  const { address } = useParams();
  return (<Navigate to={`/u/${address}/${defaultChain}`} />)
}

function InboxRoot() {
  const { address } = useParams();
  return (<Navigate to={`/u/${address}/inbox/${defaultChain}`} />)
}
