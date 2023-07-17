import React, { useState } from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction, useAccount, erc721ABI } from 'wagmi';
import { decodeEventLog } from 'viem';

// TODO update for ERC721
export function TransferButton({ chainId, collection, tokenId }) {
  const [show, setShow] = useState(false);
  const { address } = useAccount();

  if(!address || address.toLowerCase() !== (newOwner ? newOwner.toLowerCase() : item.owner?.toLowerCase())) return;
  if(show) return (<Transfer {...{item, contract, setNewOwner, newOwner, setShow}} />);
  return (<button onClick={() => setShow(true)}>
    Transfer...
  </button>);
}

export function Transfer({ item, contract, setShow, setNewOwner, newOwner }) {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const shouldSwitchChain = chain && contract.chainId !== chain.id;
  const submitReply = (event) => {
    event.preventDefault();
    write({
      args: [[item.address], event.target.newOwner.value]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contract,
    functionName: 'transferOwnership',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    onSuccess(data) {
      const decoded = data.logs.filter(log =>
          log.address.toLowerCase() === contract.address.toLowerCase())
        .map(log => decodeEventLog({
          abi: contract.abi,
          data: log.data,
          topics: log.topics,
          strict: false,
        }));
      setNewOwner(decoded[0].args.newOwner);
      setShow(false);
    },
  });
  return (
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Transfer ownership</legend>
        <input name="newOwner" defaultValue={item.owner} />
        {shouldSwitchChain ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(contract.chainId);
          }}>Switch to {contract.chainName}</button>
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

