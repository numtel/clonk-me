import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from './components/Layout.js';
import { SingleMessage } from './pages/SingleMessage.js';
import { Home } from './pages/Home.js';
import { User } from './pages/User.js';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="m/:address"
            element={<SingleMessage />}
          />
          <Route
            path="u/:address"
            element={<User />}
          />
          <Route path="*" element={<>nomatch</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
