import { Link } from "react-router-dom";
import { useContractReads, useEnsName, /*useEnsAvatar*/ } from 'wagmi';
import { chainContracts } from '../contracts.js';

// TODO add follow button (localstorage), homepage feed for followed posts
export default function UserBadge({ address, curChain }) {
  const contracts = chainContracts(curChain);
  const toLoad = [];
  if('Verification' in contracts) {
    toLoad.push({
      ...contracts.Verification,
      functionName: 'addressActive',
      args: [ address ],
    });
  }
  const { data } = useContractReads({
    contracts: toLoad,
  });
  const {data: ensName} = useEnsName({
    address,
    chainId: 1,
  });
//   const {data: ensAvatar} = useEnsAvatar({
//     address,
//     chainId: 1,
//   });
  return (
    <span className="user-badge">
      <Link to={'/u/' + address}>{ ensName ? ensName : address.slice(0, 6) + '...' + address.slice(-4) }</Link>
      { data && data[0] && data[0].result && (<span class="passport-badge" title="Passport Verified">Passport Verified</span>)}
      { /* ensAvatar && ensAvatar TODO Test! */ }
    </span>
  )
}
