import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { decodeEventLog, encodeFunctionData } from 'viem';
import { chainContracts, convertToInternal } from '../contracts.js';
import {Dialog} from './Dialog.js';

export function ReplyExternal({ collection, tokenId, chainId, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef, createRoot }) {
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const navigate = useNavigate();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const submitReply = (event) => {
    event.preventDefault();
    if(!createRoot) {
      const mintCalldata = encodeFunctionData({
        abi: contracts.ChunkedERC721.abi,
        functionName: 'mint',
        args: [ event.target.tokenURI.value ],
      });

      write({
        args: [collection, tokenId, contracts.ChunkedERC721.address, mintCalldata]
      });
    } else {
      write({
        args: [ event.target.tokenURI.value ],
      });
    }
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite(createRoot ? {
    ...contracts.ChunkedERC721,
    functionName: 'mint',
  } : {
    ...contracts.replies,
    functionName: 'addNewReply',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      const decoded = data.logs.filter(log =>
          log.address.toLowerCase() === contracts.ChunkedERC721.address.toLowerCase())
        .map(log => decodeEventLog({
          abi: contracts.ChunkedERC721.abi,
          data: log.data,
          topics: log.topics,
          strict: false,
        }));
      if(createRoot) {
        setShow(false);
        navigate(`/nft/${chainId}/${contracts.ChunkedERC721.address}/${decoded[0].args.tokenId}`);
      } else {
        const loaded = await loadListRef.current([convertToInternal(contracts.ChunkedERC721.address, decoded[0].args.tokenId)]);
        setShow(false);
        setChildForceShowRepliesRef.current(true);
        setChildRepliesRef.current((items) => {
          const thresholdIndex = items.findIndex(item => item.id === 'threshold');
          return [...items.slice(0, thresholdIndex + 1), loaded[0], ...items.slice(thresholdIndex + 1)];
        });
      }
    },
  });
  return (
    <Dialog show={true}>
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>{createRoot ? 'Create New Post' : 'Add reply'}</legend>
        <div className="field">
          <label>
            <span>External Resource URI</span>
            <input name="tokenURI" />
          </label>
        </div>
        {shouldSwitchChain && !createRoot ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(chainId);
          }}>Switch to {contracts.name}</button>
        ) : (
          <button type="submit">Submit</button>
        )}
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
    </Dialog>
  );
}

