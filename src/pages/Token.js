import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { chainContracts } from '../contracts.js';
import { DisplayTokens } from '../components/DisplayToken.js';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction } from 'wagmi';

export function Token() {
  // TODO validate these values
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { chainId, collection, tokenId } = useParams();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const contracts = chainContracts(chainId);
  const [setSortCalc, setSetSortCalc] = useState(false);
  const [disableSort, setDisableSort] = useState(false);
  const [sortSavers, setSortSavers] = useState([]);
  const { data:setSortData, isLoading:setSortLoading, isError:setSortError, isSuccess:setSortSuccess, write:setSortWrite } = useContractWrite({
    ...contracts.replies,
    functionName: 'setSortMany',
    onError() {
      setDisableSort(false);
    },
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: setSortData ? setSortData.hash : null,
    onSuccess(data) {
      for(let saver of sortSavers) {
        saver.onSuccess();
      }
      setSortSavers([]);
    },
    onSettled() {
      setDisableSort(false);
    },
  });
  return (<div id="token">
    <p>Token {chainId} {collection} {tokenId}</p>
    <DisplayTokens {...{chainId, setSortSavers, disableSort}} tokens={[{collection, tokenId}]} />
    {sortSavers.length > 0 && (
      <div className="save-sort-banner">
        {setSortCalc ? (<div className="status">Retrieving optimal sort values...</div>)
        : setSortLoading ? (<div className="status">Waiting for wallet...</div>)
        : setSortError ? (<div className="status">Error saving sort values.</div>)
        : setSortSuccess ? (
          txIsError ? (<div className="status">Transaction error!</div>)
          : txIsLoading ? (<div className="status">Waiting for transaction...</div>)
          : txIsSuccess ? (<div className="status">Transaction success!</div>)
          : (<div className="status">Transaction sent...</div>))
        : shouldSwitchChain ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(Number(chainId));
          }}>Switch to {contracts.name}</button>
        ) : (
          <button onClick={saveSort}>Save Sort</button>
        )}
      </div>
    )}
  </div>);

  async function saveSort() {
    setDisableSort(true);
    setSetSortCalc(true);
    const sorts = [];
    for(let saver of sortSavers) {
      sorts.push(await saver.fun());
    }
    setSetSortCalc(false);
    setSortWrite({
      args: [sorts],
    });
  }
}
