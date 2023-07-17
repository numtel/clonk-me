import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { chainContracts, convertToInternal } from '../contracts.js';
import { useContractReads } from 'wagmi';

export function ParentButton({ chainId, collection, tokenId, parentCount, parentZero }) {
  const [showList, setShowList] = useState(false);
  if(parentCount === 1n && parentZero) return (
    <Link to={`/nft/${chainId}/${parentZero.collection}/${parentZero.tokenId}`}>
      <button>Parent</button>
    </Link>
  );
  if(parentCount > 1n) return showList ? (
    <ParentList {...{chainId, collection, tokenId, parentCount}} />
  ) : (
    <button onClick={() => setShowList(true)}>Load {parentCount} Parents...</button>
  );
}

function ParentList({ chainId, collection, tokenId, parentCount }) {
  const contracts = chainContracts(chainId);
  const internalAddr = convertToInternal(collection, tokenId);
  const toLoad = [];
  for(let i = 0; i < parentCount; i++) {
    toLoad.push({
      ...contracts.replies,
      functionName: 'fetchParent',
      args: [internalAddr, i],
    });
  }
  const { data, isError, isLoading } = useContractReads({
    contracts: toLoad,
  });
  if(isLoading) return (
    <div>Loading parents...</div>
  );
  else if(isError) return (
    <div>Error loading parents!</div>
  );
  else if(data) return data.map((token, index) => (
    <Link key={`/nft/${chainId}/${token.result.collection}/${token.result.tokenId}`} to={`/nft/${chainId}/${token.result.collection}/${token.result.tokenId}`}>
      <button>Parent {index + 1}</button>
    </Link>
  ));
}
