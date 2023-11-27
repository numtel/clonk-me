import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { chainContracts, convertToInternal } from '../contracts.js';
import { useContractReads, erc721ABI } from 'wagmi';
import {Dialog} from './Dialog.js';

export function ParentButton({ chainId, collection, tokenId, parentCount, parentZero }) {
  const [showList, setShowList] = useState(false);
  if(parentCount === 1n && parentZero) return (
    <Link to={`/nft/${chainId}/${parentZero.collection}/${parentZero.tokenId}`}>
      <button>Parent</button>
    </Link>
  );
  if(parentCount > 1n) return (<>
    {showList && <Dialog show={true}>
      <h3>Parents</h3>
      <div className="button-list">
        <ParentList {...{chainId, collection, tokenId, parentCount}} />
        <button onClick={() => setShowList(false)}>Close</button>
      </div>
    </Dialog>}
    <button onClick={() => setShowList(!showList)}>{parentCount.toString()} Parents</button>
  </>);
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
      <button><TokenReadable {...chainId} collection={token.result.collection} tokenId={token.result.tokenId} /></button>
    </Link>
  ));
}

export function TokenReadable({ chainId, collection, tokenId }) {
  const { data, isError, isLoading } = useContractReads({
    contracts: [
      {
        chainId,
        address: collection,
        abi: erc721ABI,
        functionName: 'name',
      }
    ],
  });
  if(data) return (<span>{data[0].result} #{tokenId.toString()}</span>);
  else return (<span>{collection} #{tokenId.toString()}</span>);
}
