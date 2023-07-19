import React, { useState } from 'react';
import { useAccount } from 'wagmi';

import {ReplyPlaintext} from './ReplyPlaintext.js';
import {ReplyEmbedFile} from './ReplyEmbedFile.js';

export function ReplyButton(props) {
  const [show, setShow] = useState(false);
  const { address: walletAddress } = useAccount();

  if(!walletAddress) return;
  if(show === true) return(<ReplyChooser {...{setShow}} />);
  if(show === 'plaintext') return (<ReplyPlaintext {...props} {...{setShow}} />);
  if(show === 'embedfile') return (<ReplyEmbedFile {...props} {...{setShow}} />);
  return (<button onClick={() => setShow(true)}>
    Reply
  </button>);
}

function ReplyChooser({setShow}) {
  return (<div className="reply-type-chooser">
    <button onClick={() => setShow('plaintext')}>Plain Text</button>
    <button onClick={() => setShow('embedfile')}>File Upload</button>
  </div>);
}
