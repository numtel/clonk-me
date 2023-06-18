import React, { useState } from 'react';
import { useContractWrite, useWaitForTransaction, useAccount } from 'wagmi';

export function EditButton({ item, contract }) {
  const [show, setShow] = useState(false);
  const { address } = useAccount();

  if(!address || address.toLowerCase() !== item.owner.toLowerCase()) return;
  if(show) return (<Edit item={item} contract={contract} setShow={setShow} />);
  return (<button onClick={() => setShow(true)}>
    Edit...
  </button>);
}

export function Edit({ item, contract, setShow }) {
  const submitReply = (event) => {
    event.preventDefault();
    write({
      args: [item.address, event.target.message.value]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contract,
    functionName: 'setMessage',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
  });
  return (
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Edit message</legend>
        <textarea name="message" defaultValue={item.message}></textarea>
        <button type="submit">Submit</button>
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

