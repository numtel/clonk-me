import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, Link } from "react-router-dom";

export function Layout() {
  return (<>
    <header>
      <Link to="/"><h1>clonk.me</h1></Link>
      <ConnectButton chainStatus="none" showBalance={false} />
    </header>
    <Outlet />
  </>);
}
