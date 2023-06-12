import {Buffer} from 'buffer';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig, useNetwork } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, polygonMumbai } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import { chainContracts, defaultChain } from './contracts.js';

import { LoadMessages } from './components/MessageLoaders.js';

import './App.css';
import '@rainbow-me/rainbowkit/styles.css';

window.Buffer = window.Buffer || Buffer;

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, polygonMumbai],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});


function App() {
  const { chain } = useNetwork();
  const contracts = chainContracts(chain);
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <header>
          <ConnectButton />
        </header>
        <LoadMessages addresses={[contracts.root]} chainId={chain ? chain.id : defaultChain} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
