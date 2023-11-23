import { useState } from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction, usePublicClient } from 'wagmi';
import { normalize } from 'viem/ens';
import { chainContracts, convertToInternal } from '../contracts.js';

import {Dialog} from './Dialog.js';

export function ReplyExisting({ collection, tokenId, chainId, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef }) {
  const [token, setToken] = useState();
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const ensClient = usePublicClient({ chainId: 1 });
  const { switchNetwork } = useSwitchNetwork();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const submitReply = async (event) => {
    event.preventDefault();
    const newReply = {
      collection: event.target.collection.value,
      tokenId: event.target.tokenId.value,
    };
    if(newReply.collection.endsWith('.eth')) {
      newReply.collection = await ensClient.getEnsAddress({
        name: normalize(newReply.collection),
      });
    };
    setToken(newReply);
    write({
      args: [collection, tokenId, newReply.collection, newReply.tokenId]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.replies,
    functionName: 'addReply',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      const loaded = await loadListRef.current([convertToInternal(token.collection, token.tokenId)]);
      setShow(false);
      setChildForceShowRepliesRef.current(true);
      setChildRepliesRef.current((items) => {
        const thresholdIndex = items.findIndex(item => item.id === 'threshold');
        return [...items.slice(0, thresholdIndex + 1), loaded[0], ...items.slice(thresholdIndex + 1)];
      });
    },
  });
  return (
    <Dialog show={true}>
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Add reply</legend>
        <div className="field">
          <label>
            <span>Collection Address</span>
            <input name="collection" placeholder="Address or ENS Name" />
          </label>
        </div>
        <div className="field">
          <label>
            <span>Token ID</span>
            <input name="tokenId" />
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
      </fieldset>
    </form>
    </Dialog>
  );
}

