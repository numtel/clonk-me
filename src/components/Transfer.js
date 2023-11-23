import React, { useState } from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction, useAccount, usePublicClient, erc721ABI } from 'wagmi';
import { isAddressEqual, isAddress } from 'viem';
import { normalize } from 'viem/ens';
import { chainContracts } from '../contracts.js';
import {Dialog} from './Dialog.js';

export function TransferButton({ chainId, collection, tokenId, owner }) {
  const [show, setShow] = useState(false);
  const { address } = useAccount();

  if(!isAddress(address) || (!isAddressEqual(address, owner))) return;
  return (<>
    <button onClick={() => setShow(!show)}>
      Transfer
    </button>
    {show && <Transfer {...{chainId, collection, tokenId, setShow}} />}
  </>);
}

export function Transfer({ chainId, collection, tokenId, owner, setShow }) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { address } = useAccount();
  const ensClient = usePublicClient({ chainId: 1 });
  const contracts = chainContracts(chainId);
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const submitReply = async (event) => {
    event.preventDefault();
    const inputValue = event.target.newOwner.value;
    let ensAddress;
    if(inputValue.endsWith('.eth')) {
      ensAddress = await ensClient.getEnsAddress({
        name: normalize(inputValue),
      });
    };
    write({
      args: [address, ensAddress || inputValue, tokenId]
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
    <Dialog show={true}>
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Specify new owner address</legend>
        <input name="newOwner" placeholder="Address or ENS Name" defaultValue={owner} />
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

