import { UnsortedReplies } from './MessageLoaders.js';
import UserBadge from './UserBadge.js';

export function Message({ item, chainId }) {
  return (
    <div className="msg">
      <UserBadge address={item.owner} />
      <div className="text">{item.message}</div>
      {item.unsortedCount > 0n
        ? (<UnsortedReplies chainId={chainId} address={item.address} />)
        : (<p>No unsorted replies</p>)}
    </div>
  );
}


