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
      { ensName ? ensName : address }
      { ensAvatar ? ensAvatar : 'f000' }
    </span>
  )
}
