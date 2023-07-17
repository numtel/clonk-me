import React, { useState } from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction, useAccount, usePublicClient } from 'wagmi';
import { decodeEventLog, encodeFunctionData } from 'viem';
import { chainContracts } from '../contracts.js';

export function ReplyButton(props) {
  const [show, setShow] = useState(false);
  const { address: walletAddress } = useAccount();

  if(!walletAddress) return;
  if(show) return (<Reply {...props} {...{setShow}} />);
  return (<button onClick={() => setShow(true)}>
    Reply
  </button>);
}

export function Reply({ collection, tokenId, chainId, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef }) {
  const contracts = chainContracts(chainId);
  const publicClient = usePublicClient({ chainId: Number(chainId) });
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const submitReply = (event) => {
    event.preventDefault();
    const tokenURI = 'data:,' + encodeURIComponent(event.target.message.value);
    const mintCalldata = encodeFunctionData({
      abi: contracts.ChunkedERC721.abi,
      functionName: 'mint',
      args: [ tokenURI ],
    });

    write({
      args: [collection, tokenId, contracts.ChunkedERC721.address, mintCalldata]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.replies,
    functionName: 'addNewReply',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      const decoded = data.logs.filter(log =>
          log.address.toLowerCase() === contracts.ChunkedERC721.address.toLowerCase())
        .map(log => decodeEventLog({
          abi: contracts.ChunkedERC721.abi,
          data: log.data,
          topics: log.topics,
          strict: false,
        }));
      const internalAddr = await publicClient.readContract({
        ...contracts.replies,
        functionName: 'calcInternalAddr',
        args: [contracts.ChunkedERC721.address, decoded[0].args.tokenId]
      });
      const loaded = await loadListRef.current([internalAddr]);
      setShow(false);
      setChildForceShowRepliesRef.current(true);
      setChildRepliesRef.current((items) => {
        const thresholdIndex = items.findIndex(item => item.id === 'threshold');
        return [...items.slice(0, thresholdIndex + 1), loaded[0], ...items.slice(thresholdIndex + 1)];
      });
    },
  });
  return (
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Add reply</legend>
        <textarea name="message"></textarea>
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
