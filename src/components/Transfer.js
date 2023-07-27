import React, { useState } from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction, useAccount, erc721ABI } from 'wagmi';
import { decodeEventLog, isAddressEqual, isAddress } from 'viem';
import { chainContracts } from '../contracts.js';

export function TransferButton({ chainId, collection, tokenId, owner }) {
  const [show, setShow] = useState(false);
  const { address } = useAccount();

  if(!isAddress(address) || (!isAddressEqual(address, owner))) return;
  if(show) return (<Transfer {...{chainId, collection, tokenId, setShow}} />);
  return (<button onClick={() => setShow(true)}>
    Transfer
  </button>);
}

export function Transfer({ chainId, collection, tokenId, owner, setShow }) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();
  const contracts = chainContracts(chainId);
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const submitReply = (event) => {
    event.preventDefault();
    write({
      args: [address, event.target.newOwner.value, tokenId]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    abi: erc721ABI,
    chainId,
    address: collection,
    functionName: 'safeTransferFrom',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    onSuccess(data) {
      // TODO update without refresh
      setShow(false);
    },
  });
  return (
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Transfer ownership</legend>
        <input name="newOwner" defaultValue={owner} />
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

