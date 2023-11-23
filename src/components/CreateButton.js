import React, { useState } from 'react';
import { useAccount, useNetwork } from 'wagmi';

import {ReplyPlaintext} from './ReplyPlaintext.js';
import {ReplyEmbedFile} from './ReplyEmbedFile.js';
import {ReplyExternal} from './ReplyExternal.js';
import {Dialog} from './Dialog.js';
import {byChain} from '../contracts.js';

export function CreateButton(props) {
  const { chain } = useNetwork();
  const [show, setShow] = useState(false);
  const { address: walletAddress } = useAccount();

  if(!chain || !(chain.id in byChain)) return;
  if(!walletAddress) return;
  return (<>
    <button title="Create New Post" className="rk" onClick={() => setShow(!show)}>
      <span className="material-symbols-outlined">
        add_circle
      </span>
    </button>
    {show === true && <ReplyChooser {...{setShow, show}} />}
    {show === 'plaintext' && <ReplyPlaintext createRoot={true} {...props} {...{setShow}} chainId={chain.id} />}
    {show === 'embedfile' && <ReplyEmbedFile createRoot={true} {...props} {...{setShow}} chainId={chain.id} />}
    {show === 'external' && <ReplyExternal createRoot={true} {...props} {...{setShow}} chainId={chain.id} />}
  </>);
}

function ReplyChooser({setShow, show}) {
  return (<Dialog {...{show}}><div className="reply-type-chooser">
    <h3>Choose type for new post</h3>
    <div className="button-list">
      <button onClick={() => setShow('plaintext')}>Plain Text</button>
      <button onClick={() => setShow('embedfile')}>File Upload</button>
      <button onClick={() => setShow('external')}>External URI</button>
      <button onClick={() => setShow(false)}>Cancel</button>
    </div>
  </div></Dialog>);
}

