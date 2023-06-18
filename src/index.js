import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Layout } from './components/Layout.js';
import { SingleMessage } from './pages/SingleMessage.js';
import { Home } from './pages/Home.js';

import './App.css';
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, /*polygon, optimism, arbitrum,*/ polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';


const User = React.lazy(() => import("./pages/User.js"));

const { chains, publicClient } = configureChains(
  [mainnet, polygonMumbai],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'clonk.me',
  projectId: '3ab784972e6540d0095810e72372cfd1',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});



window.Buffer = window.Buffer || Buffer;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route
              path="about"
              element={
                <React.Suspense fallback={<>...</>}>
                  <User />
                </React.Suspense>
              }
            />
            <Route
              path="m/:address"
              element={<SingleMessage />}
            />
            <Route
              path="u/:address"
              element={
                <React.Suspense fallback={<>...</>}>
                  <User />
                </React.Suspense>
              }
            />
            <Route path="*" element={<>nomatch</>} />
          </Route>
        </Routes>
      </RainbowKitProvider>
    </WagmiConfig>
    </BrowserRouter>
  </React.StrictMode>
);

