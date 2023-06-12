import React, { useState } from 'react';
import { useContractReads } from 'wagmi';

import { msgProps } from '../contracts.js';
import messageABI from '../abi/Message.json';
import { Message } from './Message.js';


export function UnsortedReplies({ address, chainId }) {
  const [show, setShow] = useState(false);
  if(show) return (<FetchUnsortedReplies address={address} chainId={chainId} />)
  return (
    <button onClick={() => setShow(true)}>Load unsorted replies...</button>
  );
}

function FetchUnsortedReplies({ address, chainId }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [{
      address,
      chainId,
      abi: messageABI,
      functionName: 'fetchUnsorted',
      args: [0n, 10n, false],
    }],
  });
  if(isLoading) return (<div>Loading...</div>);
  else if(isError) return (<div>Error!</div>);
  else if(data) return (<LoadMessages addresses={data[0].result[0]} chainId={chainId} />);
}

export function LoadMessages({ addresses, chainId }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: addresses.map(address => msgProps.map(functionName => ({
      address,
      chainId,
      abi: messageABI,
      functionName,
    }))).flat(),
  });
  if(isLoading) return (
    <div>Loading...</div>
  );
  else if(isError) return (
    <div>Error!</div>
  );
  else if(data) return (
    <>{addresses.map((address, addrIndex) => (
      <Message key={address} item={msgProps.reduce((out, cur, index) => {
        out[cur] = data[addrIndex * msgProps.length + index].result;
        return out;
      }, { address })} />
    ))}</>
  );
}
