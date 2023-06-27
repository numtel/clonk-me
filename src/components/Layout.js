import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, Link } from "react-router-dom";

import { defaultChain, byChain } from '../contracts.js';

export const ChainContext = React.createContext(null);

export function Layout() {
  const [ disconnectedChain, setDisconnectedChain ] = useState(defaultChain);
  const chainId = String(disconnectedChain);
  return (<>
    <header>
      <Link to="/"><h1>clonk.me</h1></Link>
      <ConnectButton chainStatus="none" showBalance={false} />
      <div>
        {Object.keys(byChain).map((x) => (
          <button
            disabled={x === chainId}
            key={x}
            onClick={() => {
              setDisconnectedChain(x)
            }}
          >
            {byChain[x].name}
          </button>
        ))}
      </div>
    </header>
    <ChainContext.Provider value={{ chainId }}>
      <Outlet />
    </ChainContext.Provider>
  </>);
}
