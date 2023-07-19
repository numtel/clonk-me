import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { User } from './pages/User.js';
import { Token } from './pages/Token.js';
import { Inbox } from './pages/Inbox.js';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="u/:address"
            element={<User />}
          />
          <Route
            path="u/:address/inbox"
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
