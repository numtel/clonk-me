import { Link } from 'react-router-dom';
import { UnsortedReplies } from './MessageLoaders.js';
import { ReplyButton } from './Reply.js';
import { EditButton } from './Edit.js';
import UserBadge from './UserBadge.js';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// TODO Embed other messages [Msg chain:80001 0x2345...]
export function Message({ item, chainId }) {
  return (
    <div className="msg">
      <UserBadge address={item.owner} />
      <span className="postdate">Posted on <Link to={'/m/' + item.address}>{new Date(item.createdAt.toString() * 1000).toLocaleString()}</Link>{item.lastChanged > 0n && (<em className="edited" title={new Date(item.lastChanged.toString() * 1000).toLocaleString()}>Edited</em>)}</span>
      <div className="text">{item.message}</div>
      {item.parent !== ZERO_ADDRESS && <Link to={'/m/' + item.parent}><button>Parent</button></Link>}
      <ReplyButton address={item.address} chainId={chainId} />
      <EditButton item={item} chainId={chainId} />
      {item.unsortedCount > 0n
        ? (<UnsortedReplies chainId={chainId} address={item.address} />)
        : (<button disabled>0 Unsorted Replies</button>)}
    </div>
  );
}


