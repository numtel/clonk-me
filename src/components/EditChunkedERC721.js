import {useState} from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction } from 'wagmi';
import { isAddressEqual, isAddress } from 'viem';

import { chainContracts } from '../contracts.js';
import {EditEmbedFile} from './ReplyEmbedFile.js';
import {Dialog} from './Dialog.js';


export function EditChunkedERC721(props) {
  const [forceType, setForceType] = useState(false);
  const naturalType = props.tokenURI?.startsWith('data:,') ? 'plaintext'
    : props.tokenURI?.startsWith('data:') ? 'embed'
    : 'external';
  if(forceType === 'plaintext' || (!forceType && naturalType === 'plaintext')) {
    return (<EditPlaintext {...{...props, forceType, setForceType, naturalType}}/>);
  } else if(forceType === 'embed' || (!forceType && naturalType === 'embed')) {
    return (<EditEmbedFile {...{...props, forceType, setForceType, naturalType}}/>);
  } else {
    // External resource
    return (<EditExternal {...{...props, forceType, setForceType, naturalType}}/>);
  }
}

export function EditPlaintext({ chainId, tokenId, tokenURI, setShow, setEditedTokenURI, forceType, setForceType, naturalType }) {
  const [newTokenURI, setNewTokenURI] = useState();
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const submitReply = (event) => {
    event.preventDefault();
    const newTokenURI = 'data:,' + encodeURIComponent(event.target.message.value);
    setNewTokenURI(newTokenURI);
    write({
      args: [tokenId, newTokenURI]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.ChunkedERC721,
    functionName: 'setTokenURI',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      setEditedTokenURI(newTokenURI);
      setShow(false);
    },
  });
  return (
    <Dialog show={true}>
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Edit plaintext reply</legend>
        <textarea name="message" defaultValue={forceType ? '' : decodeURIComponent(tokenURI.slice(6))}></textarea>
        {shouldSwitchChain ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(chainId);
          }}>Switch to {contracts.name}</button>
        ) : (
          <button type="submit">Submit</button>
        )}
        {setShow && <button onClick={() => setShow(false)}>Cancel</button>}
        {isLoading && <p>Waiting for user confirmation...</p>}
        {isSuccess && (
          txIsError ? (<p>Transaction error!</p>)
          : txIsLoading ? (<p>Waiting for transaction...</p>)
          : txIsSuccess ? (<p>Transaction success!</p>)
          : (<p>Transaction sent...</p>))}
        {isError && <p>Error!</p>}
        <div className="button-list">
          <button onClick={(event) => { event.preventDefault(); setForceType('embed'); }}>Convert to file upload</button>
          <button onClick={(event) => { event.preventDefault(); setForceType('external'); }}>Convert to external resource</button>
        </div>
      </fieldset>
    </form>
    </Dialog>
  );
}


export function EditExternal({ tokenId, tokenURI, chainId, setShow, setEditedTokenURI, forceType, setForceType }) {
  const [newTokenURI, setNewTokenURI] = useState();
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const submitReply = (event) => {
    event.preventDefault();
    setNewTokenURI(event.target.tokenURI.value);
    write({
      args: [tokenId, event.target.tokenURI.value]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.ChunkedERC721,
    functionName: 'setTokenURI',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      setEditedTokenURI(newTokenURI);
      setShow(false);
    },
  });
  return (
    <Dialog show={true}>
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Edit external resource reply</legend>
        <div className="field">
          <label>
            <span>External Resource URI</span>
            <input name="tokenURI" defaultValue={forceType ? '' : tokenURI} />
          </label>
        </div>
        {shouldSwitchChain ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(chainId);
          }}>Switch to {contracts.name}</button>
        ) : (
          <button type="submit">Submit</button>
        )}
        {setShow && <button onClick={() => setShow(false)}>Cancel</button>}
        {isLoading && <p>Waiting for user confirmation...</p>}
        {isSuccess && (
          txIsError ? (<p>Transaction error!</p>)
          : txIsLoading ? (<p>Waiting for transaction...</p>)
          : txIsSuccess ? (<p>Transaction success!</p>)
          : (<p>Transaction sent...</p>))}
        {isError && <p>Error!</p>}
        <div className="button-list">
          <button onClick={(event) => { event.preventDefault(); setForceType('plaintext'); }}>Convert to plaintext</button>
          <button onClick={(event) => { event.preventDefault(); setForceType('embed'); }}>Convert to file upload</button>
        </div>
      </fieldset>
    </form>
    </Dialog>
  );
}

