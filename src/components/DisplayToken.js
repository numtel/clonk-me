import React, { useState, useRef, useEffect } from 'react';
import { erc721ABI, useContractReads, useAccount } from 'wagmi';
import { isAddressEqual, isAddress } from 'viem';
import { Link } from 'react-router-dom';

import { chainContracts, convertToInternal } from '../contracts.js';
import UserBadge from './UserBadge.js';
import { Replies } from './Replies.js';
import { ReplyButton } from './ReplyButton.js';
import { EditButton } from './EditButton.js';
import { ParentButton } from './ParentButton.js';
import { TransferButton } from './Transfer.js';
import { TruncateText } from './TruncateText.js';

export function DisplayTokens({ chainId, tokens, maxWords, setSortSavers, disableSort }) {
  const contracts = chainContracts(chainId);
  const QUERY_PER_TOKEN = 6;
  const { data, isError, isLoading } = useContractReads({
    contracts: tokens.map(token => [
      {
        chainId,
        address: token.collection,
        abi: erc721ABI,
        functionName: 'tokenURI',
        args: [token.tokenId],
      },
      {
        chainId,
        address: token.collection,
        abi: erc721ABI,
        functionName: 'ownerOf',
        args: [token.tokenId],
      },
      {
        ...contracts.replies,
        functionName: 'unsortedCount',
        args: [token.collection, token.tokenId],
      },
      {
        ...contracts.replies,
        functionName: 'sortedCount',
        args: [token.collection, token.tokenId],
      },
      {
        ...contracts.replies,
        functionName: 'parentCount',
        args: [convertToInternal(token.collection, token.tokenId)],
      },
      {
        ...contracts.replies,
        functionName: 'fetchParent',
        args: [convertToInternal(token.collection, token.tokenId), 0],
      },
    ]).flat(),
  });
  if(isLoading) return (
    <div>Loading token details...</div>
  );
  else if(isError) return (
    <div>Error loading token!</div>
  );
  else if(data) return tokens.map((token, index) => (
    <TokenWrapper
      {...{chainId, maxWords, setSortSavers, disableSort}}
      key={index}
      collection={token.collection}
      tokenId={token.tokenId}
      tokenURI={data[index * QUERY_PER_TOKEN].result}
      owner={data[index * QUERY_PER_TOKEN + 1].result}
      unsortedCount={data[index * QUERY_PER_TOKEN + 2].result}
      sortedCount={data[index * QUERY_PER_TOKEN + 3].result}
      parentCount={data[index * QUERY_PER_TOKEN + 4].result}
      parentZero={data[index * QUERY_PER_TOKEN + 5].result}
    />
  ));
}

function TokenWrapper(props) {
  const { address } = useAccount();
  const setChildRepliesRef = useRef();
  const setChildForceShowRepliesRef = useRef();
  const loadListRef = useRef();
  const [editedTokenURI, setEditedTokenURI] = useState(null);
  useEffect(() => {
    setEditedTokenURI(null);
  }, [props.collection, props.tokenId]);
  const contracts = chainContracts(props.chainId);
  const { data, /*isError, isLoading*/ } = useContractReads({
    contracts: [
      {
        ...contracts.replies,
        functionName: 'replyAddedAccount',
        args: props.parentCount > 0 && !props.replyAddedAccount ? [ convertToInternal(props.parentZero.collection, props.parentZero.tokenId), convertToInternal(props.collection, props.tokenId) ] : undefined,
      },
      {
        ...contracts.replies,
        functionName: 'replyAddedTime',
        args: props.parentCount > 0  && !props.replyAddedTime ? [ convertToInternal(props.parentZero.collection, props.parentZero.tokenId), convertToInternal(props.collection, props.tokenId) ] : undefined,
      },
    ]
  });
  return (<DisplayToken {...props} {...{editedTokenURI, setChildRepliesRef, setChildForceShowRepliesRef, loadListRef}} replyAddedAccount={props.replyAddedAccount || (data && data[0].result)} replyAddedTime={props.replyAddedTime || (data && data[1].result)}>
    <div className="controls">
      <ParentButton {...props} />
      <Link to={`/nft/${props.chainId}/${props.collection}/${props.tokenId}`}>
        <button>Permalink</button>
      </Link>
      <ReplyButton
        collection={props.collection}
        tokenId={props.tokenId}
        chainId={props.chainId}
        {...{setChildRepliesRef, setChildForceShowRepliesRef, loadListRef}}
        />
      {isAddress(address) && isAddressEqual(props.owner, address) && (<>
        <EditButton
          collection={props.collection}
          tokenId={props.tokenId}
          tokenURI={props.tokenURI}
          chainId={props.chainId}
          {...{setEditedTokenURI}}
          />
        <TransferButton
          collection={props.collection}
          tokenId={props.tokenId}
          chainId={props.chainId}
          owner={props.owner}
          />
      </>)}
    </div>
  </DisplayToken>);
}

// TODO load tokenURI from ipfs and eip4804 too!
export function DisplayToken({ chainId, maxWords, setSortSavers, disableSort, collection, tokenId, tokenURI, editedTokenURI, owner, unsortedCount, sortedCount, replyAddedTime, replyAddedAccount, children, setChildRepliesRef, setChildForceShowRepliesRef, loadListRef }) {
  const contracts = chainContracts(chainId);
  // TODO provide options for auto-display of specified mimes
  const [loadURI, setLoadURI] = useState(false);
  const [showFull, setShowFull] = useState(false);
  if(editedTokenURI !== null) tokenURI = editedTokenURI;
  if(!tokenURI) return null;
  const msgBody = (<>
    <div className="header">
      {!isAddress(replyAddedAccount) || isAddressEqual(replyAddedAccount, owner) ? (<UserBadge address={owner} curChain={chainId} />) : (<span className="different-owner">
        <span className="original"><UserBadge address={replyAddedAccount} curChain={chainId} /></span>
        <span className="current"><UserBadge address={owner} curChain={chainId} /></span>
      </span>)}
      {replyAddedTime && replyAddedTime > 0 && (
        <span className="postdate"> posted <Link to={`/nft/${chainId}/${collection}/${tokenId}`}>{remaining(Math.round(Date.now() / 1000) - replyAddedTime.toString(), true)} ago</Link></span>
      )}
      <Link target="_blank" rel="noreferrer" to={`${contracts.explorer}token/${collection}?a=${tokenId}`} title="View on Explorer" className="external">
        <span className="material-symbols-outlined">
          open_in_new
        </span>
      </Link>
      <button className="fullview" title="Expand View" onClick={() => setShowFull(!showFull)}>
        <span className="material-symbols-outlined">
          {showFull ? 'close_fullscreen' : 'open_in_full'}
        </span>
      </button>
    </div>
    {tokenURI.startsWith('data:,') ? (
      <div className="text"><TruncateText text={decodeURIComponent(tokenURI.slice(6))} maxWords={maxWords || 50}></TruncateText></div>
    ) : loadURI ? (
      <iframe title="NFT display" src={tokenURI}></iframe>
    ) : tokenURI.startsWith('data:') ? (
      <div className="preload"><a href={tokenURI} onClick={(event) => {
        event.preventDefault();
        setLoadURI(true);
      }}>Display embedded resource: {tokenURI.split(';')[0].slice(5)}</a></div>
    ) : (
      <div className="preload"><a href={tokenURI} onClick={(event) => {
        event.preventDefault();
        setLoadURI(true);
      }}>Load external resource: {tokenURI}</a></div>
    )}
    {children}
    <Replies {...{chainId, setSortSavers, disableSort, collection, tokenId, owner, unsortedCount, sortedCount, setChildRepliesRef, setChildForceShowRepliesRef, loadListRef}} />
  </>);
  return (
    <div className={`msg ${showFull ? 'full' : ''}`}>
      {showFull ? (
        <dialog open>
          {msgBody}
        </dialog>
      ) : msgBody}
    </div>
  );
}

export function remaining(seconds, onlyFirst) {
  const units = [
    { value: 1, unit: 'second' },
    { value: 60, unit: 'minute' },
    { value: 60 * 60, unit: 'hour' },
    { value: 60 * 60 * 24, unit: 'day' },
  ];
  let remaining = Number(seconds);
  let out = [];
  for(let i = units.length - 1; i >= 0;  i--) {
    if(remaining >= units[i].value) {
      const count = Math.floor(remaining / units[i].value);
      out.push(count.toString(10) + ' ' + units[i].unit + (count !== 1 ? 's' : ''));
      if(onlyFirst) return out[0];
      remaining = remaining - (count * units[i].value);
    }
  }
  return out.join(', ');
}



