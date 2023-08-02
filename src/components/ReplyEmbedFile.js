import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetwork, useSwitchNetwork, useContractWrite, useWaitForTransaction, usePublicClient, useAccount, useFeeData } from 'wagmi';
import { decodeEventLog, encodeFunctionData, bytesToHex, formatEther } from 'viem';
import { chainContracts, convertToInternal } from '../contracts.js';

import {Dialog} from './Dialog.js';

export function ReplyEmbedFile({ collection, tokenId, chainId, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef, createRoot }) {
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const { data: feeData, isError: feeDataError, isLoading: feeDataLoading } = useFeeData({ chainId: Number(chainId) });
  const { address: account } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const [ chunks, setChunks ] = useState();
  const [ gasEstimate, setGasEstimate ] = useState();
  const [ newTokenId, setNewTokenId ] = useState();
  const [ curChunk, setCurChunk ] = useState();
  const [ isCalculating, setIsCalculating ] = useState(false);
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const publicClient = usePublicClient({ chainId: Number(chainId) });
  const fileSelect = async (event) => {
    const files = event.target.files;
    if(files.length === 0) {
      setChunks(null);
      setGasEstimate(null);
      return;
    }
    const data = await fileToUint8Array(files[0]);
    setIsCalculating(true);
    const splits = await determineFileSplits(data);
    setIsCalculating(false);
    setGasEstimate(splits.gasEstimate * window.BigInt(splits.chunks.length));
    setChunks(splits.chunks);
  };
  const submitReply = async (event) => {
    event.preventDefault();
    const files = event.target.file.files;
    if(!chunks) {
      alert('No File Selected');
      return;
    }
    const tokenURI = `data:${files[0].type};base64,`;
    if(!createRoot) {
      const mintCalldata = encodeFunctionData({
        abi: contracts.ChunkedERC721.abi,
        functionName: 'mint',
        args: [ tokenURI ],
      });

      write({
        args: [collection, tokenId, contracts.ChunkedERC721.address, mintCalldata]
      });
    } else {
      write({
        args: [tokenURI],
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
      setCurChunk(0);
      setNewTokenId(decoded[0].args.tokenId);
    },
  });
  return (
    <Dialog show={true}>
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>{createRoot ? 'Create New Post' : 'Add reply'}</legend>
        <p>This operation requires multiple transactions depending on filesize.</p>
        <p>If an upload transaction fails, refresh page and edit to resume upload.</p>
        <input onChange={fileSelect} type="file" name="file" />
        {shouldSwitchChain && !createRoot ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(chainId);
          }}>Switch to {contracts.name}</button>
        ) : (
          <button type="submit">Submit</button>
        )}
        {setShow && <button onClick={() => setShow(false)}>Cancel</button>}
        {chunks ?
          feeDataLoading ? (<p>Loading fee data...</p>)
          : feeDataError ? (<p>Error loading fee data!</p>)
          : (<p>Total Upload Estimate: {formatEther(gasEstimate * feeData.gasPrice)} {contracts.nativeCurrency} at {feeData.formatted.gasPrice} GWEI</p>)
          : null }
        {isCalculating && <p>Calculating chunk sizes...</p>}
        {isLoading && <p>Waiting for user confirmation...</p>}
        {isSuccess && (
          txIsError ? (<p>Transaction error!</p>)
          : txIsLoading ? (<p>Waiting for transaction...</p>)
          : txIsSuccess ? chunks.map((chunk, index) => (
            <UploadChunk {...{contracts, chainId, newTokenId, chunk, index, curChunk, setCurChunk, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef, createRoot}} count={chunks.length} key={index} />
          ))
          : (<p>Transaction sent...</p>))}
        {isError && <p>Error!</p>}
      </fieldset>
    </form>
    </Dialog>
  );

  async function determineFileSplits(data) {
    let hadError = true;
    let testData = data;
    let gasEstimate;
    while(hadError) {
      hadError = false;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          ...contracts.ChunkedERC721,
          functionName: 'uploadEstimateDummy',
          account,
          args: [ bytesToHex(testData) ],
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
    return {chunks: splits, gasEstimate};
  }
}

export function EditEmbedFile({ tokenId, tokenURI, chainId, setShow, setEditedTokenURI, forceType, setForceType }) {
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const { data: feeData, isError: feeDataError, isLoading: feeDataLoading } = useFeeData({ chainId: Number(chainId) });
  const { address: account } = useAccount();
  const { switchNetwork } = useSwitchNetwork();
  const [ chunks, setChunks ] = useState();
  const [ gasEstimate, setGasEstimate ] = useState();
  const [ newTokenId, setNewTokenId ] = useState();
  const [ newTokenURI, setNewTokenURI ] = useState();
  const [ resumeByte, setResumeByte ] = useState(0);
  const [ curChunk, setCurChunk ] = useState();
  const [ isCalculating, setIsCalculating ] = useState(false);
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const publicClient = usePublicClient({ chainId: Number(chainId) });
  const fileSelect = async (event) => {
    const existingData = forceType ? [] : base64ToArrayBuffer(tokenURI.split(',')[1]);
    const files = event.target.files;
    if(files.length === 0) {
      setChunks(null);
      setGasEstimate(null);
      return;
    }
    const data = await fileToUint8Array(files[0]);
    let resumeByte;
    for(resumeByte = 0; resumeByte < existingData.length; resumeByte++) {
      if(data[resumeByte] !== existingData[resumeByte]) {
        resumeByte = 0;
        break;
      }
    }
    if(existingData.length === data.length && resumeByte > 0) resumeByte = -1;
    setResumeByte(resumeByte);
    setNewTokenURI(await fileToDataURL(files[0]));
    setIsCalculating(true);
    const splits = await determineFileSplits(data, resumeByte);
    setIsCalculating(false);
    setGasEstimate(splits.gasEstimate * window.BigInt(splits.chunks.length));
    setChunks(splits.chunks);
  };
  const submitReply = async (event) => {
    event.preventDefault();
    const files = event.target.file.files;
    if(!chunks) {
      alert('No File Selected');
      return;
    }
    const newTokenURI = `data:${files[0].type};base64,`;

    if(!resumeByte) {
      write({
        args: [tokenId, newTokenURI]
      });
    } else {
      setCurChunk(0);
      // XXX state variable not needed here but...refactor later
      setNewTokenId(tokenId);
    }
  };
  const { data, isLoading, isError, isSuccess, write } = useContractWrite({
    ...contracts.ChunkedERC721,
    functionName: 'setTokenURI',
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: data ? data.hash : null,
    async onSuccess(data) {
      setCurChunk(0);
      // XXX state variable not needed here but...refactor later
      setNewTokenId(tokenId);
    },
  });
  return (
    <Dialog show={true}>
    <form onSubmit={submitReply}>
      <fieldset>
        <legend>Edit embedded file reply</legend>
        <p>This operation requires multiple transactions depending on filesize.</p>
        <p>Will resume partially uploaded files if possible.</p>
        <input onChange={fileSelect} type="file" name="file" />
        {shouldSwitchChain ? (
          <button onClick={(event) => {
            event.preventDefault();
            switchNetwork(chainId);
          }}>Switch to {contracts.name}</button>
        ) : (
          <button type="submit">Submit</button>
        )}
        {setShow && <button onClick={() => setShow(false)}>Cancel</button>}
        {resumeByte === -1 && (<p>This file is already uploaded successfully.</p>)}
        {resumeByte >= 0  && chunks ?
          feeDataLoading ? (<p>Loading fee data...</p>)
          : feeDataError ? (<p>Error loading fee data!</p>)
          : (<>{resumeByte > 0 && (<p>Resume from byte number {resumeByte}</p>)}<p>Total Upload Estimate: {formatEther(gasEstimate * feeData.gasPrice)} {contracts.nativeCurrency} at {feeData.formatted.gasPrice} GWEI</p></>)
          : null }
        {isCalculating && <p>Calculating chunk sizes...</p>}
        {isLoading && <p>Waiting for user confirmation...</p>}
        {(isSuccess || resumeByte > 0) && (
          txIsError ? (<p>Transaction error!</p>)
          : txIsLoading ? (<p>Waiting for transaction...</p>)
          : (txIsSuccess || resumeByte > 0) && chunks ? chunks.map((chunk, index) => (
            <UploadChunk {...{contracts, chainId, newTokenId, chunk, index, curChunk, setCurChunk, setShow, setEditedTokenURI, newTokenURI}} count={chunks.length} key={index} />
          ))
          : (<p>Transaction sent...</p>))}
        {isError && <p>Error!</p>}
        <div className="button-list">
          <button onClick={(event) => { event.preventDefault(); setForceType('plaintext'); }}>Convert to plaintext</button>
          <button onClick={(event) => { event.preventDefault(); setForceType('external'); }}>Convert to external resource</button>
        </div>
      </fieldset>
    </form>
    </Dialog>
  );

  async function determineFileSplits(data, resumeByte) {
    let hadError = true;
    let testData = resumeByte ? data.slice(resumeByte) : data;
    let gasEstimate;
    while(hadError) {
      hadError = false;
      try {
        gasEstimate = await publicClient.estimateContractGas({
          ...contracts.ChunkedERC721,
          functionName: 'uploadEstimateDummy',
          account,
          args: [ bytesToHex(testData) ],
        });
      } catch(error) {
        hadError = true;
        // TODO could probably make this more efficient for some lengths
        testData = testData.slice(0, Math.ceil(testData.length / 2));
      }
    }
    let splitsLen = testData.length;
    const splits = [ testData ];
    while(splitsLen + resumeByte < data.length) {
      splits.push(data.slice(splitsLen + resumeByte, splitsLen + resumeByte + testData.length));
      splitsLen += testData.length;
    }
    return {chunks: splits, gasEstimate};
  }
}

function UploadChunk({ contracts, newTokenId, chainId, chunk, index, count, curChunk, setCurChunk, setShow, setChildRepliesRef, loadListRef, setChildForceShowRepliesRef, setEditedTokenURI, newTokenURI, createRoot }) {
  const navigate = useNavigate();
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
        if(setEditedTokenURI) {
          setEditedTokenURI(newTokenURI);
          setShow(false);
        } else if(createRoot) {
          setShow(false);
          navigate(`/nft/${chainId}/${contracts.ChunkedERC721.address}/${newTokenId}`);
        } else {
          const loaded = await loadListRef.current([convertToInternal(contracts.ChunkedERC721.address, newTokenId)]);
          setShow(false);
          setChildForceShowRepliesRef.current(true);
          setChildRepliesRef.current((items) => {
            const thresholdIndex = items.findIndex(item => item.id === 'threshold');
            return [...items.slice(0, thresholdIndex + 1), loaded[0], ...items.slice(thresholdIndex + 1)];
          });
        }
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

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function() {
      resolve(this.result);
    };
    reader.readAsDataURL(file);
  });
}

// https://stackoverflow.com/a/21797381
function base64ToArrayBuffer(base64) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
