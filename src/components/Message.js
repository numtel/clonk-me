import { UnsortedReplies } from './MessageLoaders.js';
import { ReplyButton } from './Reply.js';
import { EditButton } from './Edit.js';
import UserBadge from './UserBadge.js';

export function Message({ item, chainId }) {
  return (
    <div className="msg">
      <UserBadge address={item.owner} />
      <p>Posted on {new Date(item.createdAt.toString() * 1000).toLocaleString()}{item.lastChanged > 0n && (<em className="edited" title={new Date(item.lastChanged.toString() * 1000).toLocaleString()}>Edited</em>)}</p>
      <div className="text">{item.message}</div>
      <ReplyButton address={item.address} chainId={chainId} />
      <EditButton item={item} chainId={chainId} />
      {item.unsortedCount > 0n
        ? (<UnsortedReplies chainId={chainId} address={item.address} />)
        : (<p>No unsorted replies</p>)}
    </div>
  );
}


