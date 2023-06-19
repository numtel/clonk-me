import React, { useState } from 'react';
import { useContractWrite, useWaitForTransaction, useAccount } from 'wagmi';
import { decodeEventLog } from 'viem';

export function ReplyButton(props) {
  const [show, setShow] = useState(false);
  const { address: walletAddress } = useAccount();

  if(!walletAddress) return;
  if(show) return (<Reply {...props} {...{setShow}} />);
  return (<button onClick={() => setShow(true)}>
    Reply...
  </button>);
}

export function Reply({ address, contract, setShow, setReplies, loadList, setForceShowReplies }) {
  const submitReply = (event) => {
    event.preventDefault();
    write({
      args: [address, event.target.message.value]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contract,
    functionName: 'postNew',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      const decoded = data.logs.filter(log =>
          log.address.toLowerCase() === contract.address.toLowerCase())
        .map(log => decodeEventLog({
          abi: contract.abi,
          data: log.data,
          topics: log.topics,
          strict: false,
        }));
      const loaded = await loadList([decoded[0].args.item]);
      setShow(false);
      setForceShowReplies(true);
      setReplies((items) => {
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
