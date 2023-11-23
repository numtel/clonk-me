import { useNetwork, useContractWrite, useWaitForTransaction, useSwitchNetwork } from 'wagmi';

import { chainContracts } from '../contracts.js';
import {Dialog} from './Dialog.js';

export function RescindButton({ chainId, parentCollection, parentTokenId, replyCollection, replyTokenId }) {
  const { chain } = useNetwork();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const { switchNetwork } = useSwitchNetwork();
  const contracts = chainContracts(chainId);


  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.replies,
    functionName: 'rescindReply',
    args: [ parentCollection, parentTokenId, replyCollection, replyTokenId ],
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data && data.hash,
  });

  return (<>
    <button onClick={() => shouldSwitchChain ? switchNetwork(chainId) : write()}>Rescind</button>
    {isLoading && <Dialog show={true}>Waiting for user confirmation...</Dialog>}
    {isSuccess && (
      txIsError ? (<Dialog show={true} button="Ok">Transaction error!</Dialog>)
      : txIsLoading ? (<Dialog show={true}>Waiting for transaction...</Dialog>)
      : txIsSuccess ? (<Dialog show={true} button="Ok">Reply Rescinded Successfully!</Dialog>)
      : (<Dialog show={true}>Transaction sent...</Dialog>))}
    {isError && <Dialog show={true} button="Ok">Error!</Dialog>}
  </>);
}
