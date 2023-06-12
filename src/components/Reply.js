import React, { useState } from 'react';
import { useContractWrite } from 'wagmi';

import { chainContracts } from '../contracts.js';
import factoryABI from '../abi/Messages.json';


export function ReplyButton({ address, chainId }) {
  const [show, setShow] = useState(false);

  if(show) return (<Reply address={address} chainId={chainId} />);
  return (<button onClick={() => setShow(true)}>
    Reply...
  </button>);
}

export function Reply({ address, chainId }) {
  const contracts = chainContracts(chainId);
  const submitReply = (event) => {
    event.preventDefault();
    write({
      args: [address, event.target.message.value]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    address: contracts.factory,
    abi: factoryABI,
    chainId,
    functionName: 'postNew',
  });
  return (
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Add reply</legend>
        <textarea name="message"></textarea>
        <button type="submit">Submit</button>
        {isLoading && <p>Loading...</p>}
        {isSuccess && <p>Success!</p>}
        {isError && <p>Error!</p>}
      </fieldset>
    </form>
  );
}
