import React, { useState } from 'react';
import { useAccount } from 'wagmi';

import {ReplyPlaintext} from './ReplyPlaintext.js';
import {ReplyEmbedFile} from './ReplyEmbedFile.js';
import {ReplyExisting} from './ReplyExisting.js';
import {ReplyExternal} from './ReplyExternal.js';

export function ReplyButton(props) {
  const [show, setShow] = useState(false);
  const { address: walletAddress } = useAccount();

  if(!walletAddress) return;
  if(show === true) return(<ReplyChooser {...{setShow}} />);
  if(show === 'plaintext') return (<ReplyPlaintext {...props} {...{setShow}} />);
  if(show === 'embedfile') return (<ReplyEmbedFile {...props} {...{setShow}} />);
  if(show === 'existing') return (<ReplyExisting {...props} {...{setShow}} />);
  if(show === 'external') return (<ReplyExternal {...props} {...{setShow}} />);
  return (<button onClick={() => setShow(true)}>
    Reply
  </button>);
}

function ReplyChooser({setShow}) {
  return (<div className="reply-type-chooser">
    <button onClick={() => setShow('plaintext')}>Plain Text</button>
    <button onClick={() => setShow('embedfile')}>File Upload</button>
    <button onClick={() => setShow('existing')}>Existing NFT</button>
    <button onClick={() => setShow('external')}>External URI</button>
    <button onClick={() => setShow(false)}>Cancel</button>
  </div>);
}
