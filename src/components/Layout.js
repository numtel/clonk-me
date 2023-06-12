import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet } from "react-router-dom";

export function Layout() {
  return (<>
    <header>
      <ConnectButton />
    </header>
    <Outlet />
  </>);
}
