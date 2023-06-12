import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet } from "react-router-dom";

// TODO use custom connectbutton that allows chain choosing even without wallet connected
export function Layout() {
  return (<>
    <header>
      <ConnectButton />
    </header>
    <Outlet />
  </>);
}
