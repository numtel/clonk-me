import { Link } from "react-router-dom";
import { useEnsName, useEnsAvatar } from 'wagmi';

export default function UserBadge({ address }) {
  const {data: ensName} = useEnsName({
    address,
    chainId: 1,
  });
  const {data: ensAvatar} = useEnsAvatar({
    address,
    chainId: 1,
  });
  return (
    <span className="user-badge">
      <Link to={'/u/' + address}>{ ensName ? ensName : address.slice(0, 6) + '...' + address.slice(-4) }</Link>
      { /* ensAvatar && ensAvatar TODO Test! */ }
    </span>
  )
}
