import React, {createContext, useState} from 'react';
import { createBrowserRouter, RouterProvider, Navigate, useParams } from "react-router-dom";
import { Layout } from './components/Layout.js';
import { Home } from './pages/Home.js';
import { LatestPosts } from './pages/LatestPosts.js';
import { User } from './pages/User.js';
import { Token } from './pages/Token.js';
import { Inbox } from './pages/Inbox.js';
import { defaultChain } from './contracts.js';
import {DEFAULT_CHAIN_LOCALSTORAGE_KEY} from './components/SettingsButton.js';

export const DefaultChainContext = createContext(null);
export const LoadedRepliesContext = createContext(null);
export const MinimizedContext = createContext(null);
// In case of errors during replying, cache the text value so it's not lost
export const ReplyCacheContext = createContext(null);

export function Router() {
  const loadedRepliesState = useState({});
  const minimizedState = useState({});
  const defaultChainState = useState(localStorage.getItem(DEFAULT_CHAIN_LOCALSTORAGE_KEY) || defaultChain);
  const replyCacheState = useState('');
  const myDefaultChain = defaultChainState[0];
  const router = createBrowserRouter([
    {
      element: <Layout />,
      children: [
        {
          errorElement: <ErrorPage />,
          children: [
            {
              path: "/",
              element: <Navigate to={`/home/${myDefaultChain}`} />,
            },
            {
              path: "home",
              element: <Navigate to={`/home/${myDefaultChain}`} />,
            },
            {
              path: "home/:chainId",
              element: <Home />,
            },
            {
              path: "latest",
              element: <Navigate to={`/latest/${myDefaultChain}`} />,
            },
            {
              path: "latest/:chainId",
              element: <LatestPosts />,
            },
            {
              path: "u/:address",
              element: <UserProfileRoot {...{myDefaultChain}} />,
            },
            {
              path: "u/:address/:chainId",
              element: <User />,
            },
            {
              path: "u/:address/inbox",
              element: <InboxRoot {...{myDefaultChain}} />,
            },
            {
              path: "u/:address/inbox/:chainId",
              element: <Inbox />,
            },
            {
              path: "nft/:chainId/:collection/:tokenId",
              element: <Token />,
            },
            {
              path: "*",
              element: <ErrorPage />,
            },
          ],
        },
      ],
    },
  ]);
  return (
    <LoadedRepliesContext.Provider value={loadedRepliesState}>
    <MinimizedContext.Provider value={minimizedState}>
    <DefaultChainContext.Provider value={defaultChainState}>
    <ReplyCacheContext.Provider value={replyCacheState}>
    <RouterProvider {...{router}} />
    </ReplyCacheContext.Provider>
    </DefaultChainContext.Provider>
    </MinimizedContext.Provider>
    </LoadedRepliesContext.Provider>
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

function ErrorPage() {
  return (<p>An error has occurred!</p>);
}
