import {useState} from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction } from 'wagmi';
import { chainContracts, convertToInternal } from '../contracts.js';
import { isAddressEqual, isAddress } from 'viem';


export function EditChunkedERC721(props) {
  if(props.tokenURI?.startsWith('data:,')) {
    // Plaintext
    return EditPlaintext(props);
  } else if(props.tokenURI?.startsWith('data:')) {
    // File Upload
  } else {
    // External resource
  }
}

export function EditPlaintext({ chainId, tokenId, tokenURI, setShow, setEditedTokenURI }) {
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
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Edit plaintext reply</legend>
        <textarea name="message" defaultValue={decodeURIComponent(tokenURI.slice(6))}></textarea>
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
      </fieldset>
    </form>
  );
}

