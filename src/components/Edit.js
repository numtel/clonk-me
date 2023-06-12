import React, { useState } from 'react';
import { useContractWrite, useAccount } from 'wagmi';

import messageABI from '../abi/Message.json';

export function EditButton({ item, chainId }) {
  const [show, setShow] = useState(false);
  const { address } = useAccount();

  if(!address || address.toLowerCase() !== item.owner.toLowerCase()) return;
  if(show) return (<Edit item={item} chainId={chainId} setShow={setShow} />);
  return (<button onClick={() => setShow(true)}>
    Edit...
  </button>);
}

export function Edit({ item, chainId, setShow }) {
  const submitReply = (event) => {
    event.preventDefault();
    write({
      args: [event.target.message.value]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    address: item.address,
    abi: messageABI,
    chainId,
    functionName: 'setMessage',
  });
  return (
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Edit message</legend>
        <textarea name="message" defaultValue={item.message}></textarea>
        <button type="submit">Submit</button>
        {setShow && <button onClick={() => setShow(false)}>Cancel</button>}
        {isLoading && <p>Loading...</p>}
        {isSuccess && <p>Success!</p>}
        {isError && <p>Error!</p>}
      </fieldset>
    </form>
  );
}

