import { Buffer } from 'buffer';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, /*polygon, optimism, arbitrum,*/ polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { Router } from './Router.js';

import './App.css';
import '@rainbow-me/rainbowkit/styles.css';


const { chains, publicClient } = configureChains(
  [mainnet, {...polygonMumbai, rpcUrls: {
    public: { http: ['https://rpc.ankr.com/polygon_mumbai'] },
    default: { http: ['https://rpc.ankr.com/polygon_mumbai'] },
  }}],
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
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Router />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>
);

