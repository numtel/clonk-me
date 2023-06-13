import React, { useState } from 'react';
import { useContractReads } from 'wagmi';

import { chainContracts } from '../contracts.js';
import { msgProps } from '../contracts.js';
import messageABI from '../abi/Message.json';
import factoryABI from '../abi/Messages.json';
import { Message } from './Message.js';


export function UnsortedReplies({ address, chainId, unsortedCount }) {
  const [show, setShow] = useState(false);
  if(show) return (<FetchUnsortedReplies unsortedCount={unsortedCount} address={address} chainId={chainId} />)
  return (
    <button onClick={() => setShow(true)}>{unsortedCount.toString()} Unsorted {unsortedCount === 1n ? 'Reply' : 'Replies'}</button>
  );
}

function FetchUnsortedReplies({ address, chainId, unsortedCount }) {
  // TODO add pagination
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
  else if(data) return addresses.map((address, addrIndex) => (
      <Message
        key={address}
        chainId={chainId}
        item={msgProps.reduce((out, cur, index) => {
          out[cur] = data[addrIndex * msgProps.length + index].result;
          return out;
        }, { address })}
      />
    ));
}

export function UserMessages({ address, chainId }) {
  const contracts = chainContracts(chainId);
  // TODO add pagination
  const { data, isError, isLoading } = useContractReads({
    contracts: [{
      address: contracts.factory,
      chainId,
      abi: factoryABI,
      functionName: 'fetchUserMessages',
      args: [address, 0n, 10n],
    }],
  });
  if(isLoading) return (<div>Loading...</div>);
  else if(isError) return (<div>Error!</div>);
  else if(data) return (<LoadMessages addresses={data[0].result[0]} chainId={chainId} />);
}
