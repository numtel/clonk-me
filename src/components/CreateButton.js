import React, { useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

import {ReplyPlaintext} from './ReplyPlaintext.js';
import {ReplyEmbedFile} from './ReplyEmbedFile.js';
import {ReplyExternal} from './ReplyExternal.js';

export function CreateButton(props) {
  const { chain } = useNetwork();
  const [show, setShow] = useState(false);
  const { address: walletAddress } = useAccount();

  if(!walletAddress) return;
  if(show === true) return(<ReplyChooser {...{setShow}} />);
  if(show === 'plaintext') return (<ReplyPlaintext createRoot={true} {...props} {...{setShow}} chainId={chain.id} />);
  if(show === 'embedfile') return (<ReplyEmbedFile createRoot={true} {...props} {...{setShow}} chainId={chain.id} />);
  if(show === 'external') return (<ReplyExternal createRoot={true} {...props} {...{setShow}} chainId={chain.id} />);
  return (<button title="Create New Post" className="icon" onClick={() => setShow(true)}>
    <span className="material-symbols-outlined">
      add_circle
    </span>
  </button>);
}

function ReplyChooser({setShow}) {
  return (<div className="reply-type-chooser">
    <button onClick={() => setShow('plaintext')}>Plain Text</button>
    <button onClick={() => setShow('embedfile')}>File Upload</button>
    <button onClick={() => setShow('external')}>External URI</button>
    <button onClick={() => setShow(false)}>Cancel</button>
  </div>);
}

