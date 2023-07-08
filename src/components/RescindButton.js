
import { chainContracts } from '../contracts.js';
import { useNetwork, useContractWrite, useWaitForTransaction } from 'wagmi';

export function RescindButton({ chainId, parentCollection, parentTokenId, replyCollection, replyTokenId }) {
  const { chain } = useNetwork();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const contracts = chainContracts(chainId);


  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.replies,
    functionName: 'rescindReply',
    args: [ parentCollection, parentTokenId, replyCollection, replyTokenId ],
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data && data.hash,
  });

  if(shouldSwitchChain) return null;

  return (<>
    <button onClick={write}>Rescind</button>
    {isLoading && <p className="status">Waiting for user confirmation...</p>}
    {isSuccess && (
      txIsError ? (<p className="status">Transaction error!</p>)
      : txIsLoading ? (<p className="status">Waiting for transaction...</p>)
      : txIsSuccess ? (<p className="status">Reply Rescinded Successfully!</p>)
      : (<p className="status">Transaction sent...</p>))}
    {isError && <p className="status">Error!</p>}
  </>);
}
