import React, { useState } from 'react';
import { useAccount } from 'wagmi';

import {ReplyPlaintext} from './ReplyPlaintext.js';
import {ReplyEmbedFile} from './ReplyEmbedFile.js';
import {ReplyExisting} from './ReplyExisting.js';
import {ReplyExternal} from './ReplyExternal.js';
import {Dialog} from './Dialog.js';

export function ReplyButton(props) {
  const [show, setShow] = useState(false);
  const { address: walletAddress } = useAccount();

  if(!walletAddress) return;
  return (<>
    <button onClick={() => setShow(!show)}>
      Reply
    </button>
    {show === true && <ReplyChooser {...{setShow}} />}
    {show === 'plaintext' && <ReplyPlaintext {...props} {...{setShow}} />}
    {show === 'embedfile' && <ReplyEmbedFile {...props} {...{setShow}} />}
    {show === 'existing' && <ReplyExisting {...props} {...{setShow}} />}
    {show === 'external' && <ReplyExternal {...props} {...{setShow}} />}
  </>);
}

function ReplyChooser({setShow}) {
  return (<Dialog show={true}><div className="reply-type-chooser">
    <h3>Choose type for new reply</h3>
    <div className="button-list">
      <button onClick={() => setShow('plaintext')}>Plain Text</button>
      <button onClick={() => setShow('embedfile')}>File Upload</button>
      <button onClick={() => setShow('existing')}>Existing NFT</button>
      <button onClick={() => setShow('external')}>External URI</button>
      <button onClick={() => setShow(false)}>Cancel</button>
    </div>
  </div></Dialog>);
}
