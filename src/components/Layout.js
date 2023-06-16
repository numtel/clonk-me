import { useNetwork } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, Link } from "react-router-dom";

// TODO use custom connectbutton that allows chain choosing even without wallet connected
export function Layout() {
  const { chain } = useNetwork();
  return (<>
    <header>
      <Link to="/"><h1>clonk.me</h1></Link>
      <ConnectButton />
    </header>
    {(chain && (chain.id === 1 || chain.unsupported)) ? (<>
      <p>Please select Polygon or Mumbai, this chain is not yet supported.</p>
    </>) : (<Outlet />)}
  </>);
}
