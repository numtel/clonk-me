import React, { useState, useEffect, useRef } from 'react';
import { useContractReads, usePublicClient } from 'wagmi';

import { Message } from './Message.js';

export function LoadMessages({ addresses, contract }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: addresses.map(address => [
    {
      ...contract,
      functionName: 'getMsg',
      args: [address],
    },
    {
      ...contract,
      functionName: 'sortedCount',
      args: [address],
    },
    {
      ...contract,
      functionName: 'unsortedCount',
      args: [address],
    },
    ]).flat(),
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
        contract={contract}
        item={Object.assign({ address, id:address }, data[addrIndex * 3].result, {
          sortedCount: data[addrIndex * 3 + 1].result,
          unsortedCount: data[addrIndex * 3 + 2].result,
        })}
      />
    ));
}

// XXX: Only one UserMessages instance per page so this is fine
let prevChainId;

export function UserMessages({ address, contract, pageSize, chainId }) {
  const publicClient = usePublicClient({ chainId: contract.chainId });
  const [list, setList] = useState(() => {
    return [];
  });
  useEffect(() => {
    if(chainId !== prevChainId) {
      setList([]);
      prevChainId = chainId;
      loadMore(0);
    }
  }, [ chainId ]);
  const [lastScanned, setLastScanned] = useState(null);
  const { data, isError, isLoading } = useContractReads({
    contracts: [{
      ...contract,
      functionName: 'userMessageCount',
      args: [address],
    }],
  });
  async function loadMore(startIndex) {
    const newData = await publicClient.readContract({
      ...contract,
      functionName: 'fetchUserMessages',
      args: [address, startIndex, pageSize, true],
    });
    setLastScanned(newData[1] - newData[2]);
    setList(list => {
      return [...list, ...newData[0]];
    })
  }
  return (
    <>
      {isLoading && (<div>Loading...</div>)}
      {isError && (<div>Error!</div>)}
      {data && (
        <p>Number of posts: {data[0].result.toString()}</p>
      )}
      {list.length > 0 && (<>
        <LoadMessages addresses={list} contract={contract} />
        {data && (list.length < data[0].result) && (<button onClick={() => loadMore(lastScanned)}>Load More Posts</button>)}
      </>)}
    </>
  );
}

