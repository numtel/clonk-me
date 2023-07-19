import { useState, useEffect } from 'react';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction, usePublicClient, useAccount } from 'wagmi';
import { decodeEventLog, encodeFunctionData, bytesToHex } from 'viem';
import { chainContracts, convertToInternal } from '../contracts.js';

export function ReplyEmbedFile({ collection, tokenId, chainId, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef }) {
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const [ chunks, setChunks ] = useState();
  const [ newTokenId, setNewTokenId ] = useState();
  const [ curChunk, setCurChunk ] = useState();
  const [ isCalculating, setIsCalculating ] = useState(false);
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const publicClient = usePublicClient({ chainId: Number(chainId) });
  const submitReply = async (event) => {
    event.preventDefault();
    const files = event.target.file.files;
    if(files.length === 0) {
      alert('No File Selected');
      return;
    }
    const data = await fileToUint8Array(files[0]);
    const tokenURI = `data:${files[0].type};base64,`;
    const mintCalldata = encodeFunctionData({
      abi: contracts.ChunkedERC721.abi,
      functionName: 'mint',
      args: [ tokenURI ],
    });
    setIsCalculating(true);
    const splits = await determineFileSplits(data);
    setIsCalculating(false);
    setChunks(splits);

    write({
      args: [collection, tokenId, contracts.ChunkedERC721.address, mintCalldata]
    });
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
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
      setCurChunk(0);
      setNewTokenId(decoded[0].args.tokenId);
    },
  });
  return (
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Add reply</legend>
        <p>This operation requires multiple transactions depending on filesize.</p>
        <input type="file" name="file" />
        {shouldSwitchChain ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(chainId);
          }}>Switch to {contracts.name}</button>
        ) : (
          <button type="submit">Submit</button>
        )}
        {setShow && <button onClick={() => setShow(false)}>Cancel</button>}
        {isCalculating && <p>Calculating chunk sizes...</p>}
        {isLoading && <p>Waiting for user confirmation...</p>}
        {isSuccess && (
          txIsError ? (<p>Transaction error!</p>)
          : txIsLoading ? (<p>Waiting for transaction...</p>)
          : txIsSuccess ? chunks.map((chunk, index) => (
            <UploadChunk {...{contracts, chainId, newTokenId, chunk, index, curChunk, setCurChunk, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef}} count={chunks.length} key={index} />
          ))
          : (<p>Transaction sent...</p>))}
        {isError && <p>Error!</p>}
      </fieldset>
    </form>
  );

  async function determineFileSplits(data) {
    let hadError = true;
    let testData = data;
    while(hadError) {
      hadError = false;
      try {
        await publicClient.estimateContractGas({
          ...contracts.ChunkedERC721,
          functionName: 'appendTokenURI',
          account,
          // Dummy tokenId but gas price shouldn't matter on which token
          args: [ 1, bytesToHex(testData) ],
        });
      } catch(error) {
        hadError = true;
        // TODO could probably make this more efficient for some lengths
        testData = testData.slice(0, Math.ceil(testData.length / 2));
      }
    }
    let splitsLen = testData.length;
    const splits = [ testData ];
    while(splitsLen < data.length) {
      splits.push(data.slice(splitsLen, splitsLen + testData.length));
      splitsLen += testData.length;
    }
    return splits;
  }
}

function UploadChunk({ contracts, newTokenId, chainId, chunk, index, count, curChunk, setCurChunk, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef }) {
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.ChunkedERC721,
    functionName: 'appendTokenURI',
    args: [ newTokenId, bytesToHex(chunk) ]
  });
  useEffect(() => {
    if(curChunk === index) write();
  }, [curChunk]);
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      if(index + 1 < count) {
        setCurChunk(index + 1);
      } else {
        const loaded = await loadListRef.current([convertToInternal(contracts.ChunkedERC721.address, newTokenId)]);
        setShow(false);
        setChildForceShowRepliesRef.current(true);
        setChildRepliesRef.current((items) => {
          const thresholdIndex = items.findIndex(item => item.id === 'threshold');
          return [...items.slice(0, thresholdIndex + 1), loaded[0], ...items.slice(thresholdIndex + 1)];
        });
      }
    },
  });
  return (<>
    {isLoading ? (<p>Waiting for user confirmation...</p>)
     : isError ? (<p>Error uploading chunk {index + 1}</p>)
     : isSuccess ? (
        txIsError ? (<p>Transaction error!</p>)
        : txIsLoading ? (<p>Waiting for transaction...</p>)
        : txIsSuccess ? (<p>Chunk {index + 1} uploaded successfully!</p>)
        : (<p>Unknown state</p>))
      : (<p>Waiting to upload chunk {index + 1} of {count}</p>)}
  </>);
}

function fileToUint8Array(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function() {
      resolve(new Uint8Array(this.result));
    };
    reader.readAsArrayBuffer(file);
  });
}
