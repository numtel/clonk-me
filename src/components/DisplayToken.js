import React, { useState, useRef } from 'react';
import { erc721ABI, useContractReads } from 'wagmi';
import { Link } from 'react-router-dom';
import Linkify from 'react-linkify';

import { chainContracts, convertToInternal } from '../contracts.js';
import UserBadge from './UserBadge.js';
import { Replies } from './Replies.js';
import { ReplyButton } from './ReplyButton.js';
import { ParentButton } from './ParentButton.js';

export function DisplayTokens({ chainId, tokens, setSortSavers, disableSort }) {
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
      {...{chainId, setSortSavers, disableSort}}
      key={`${token.collection}-${token.tokenId}`}
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
  const setChildRepliesRef = useRef();
  const setChildForceShowRepliesRef = useRef();
  const loadListRef = useRef();
  return (<DisplayToken {...props} {...{setChildRepliesRef, setChildForceShowRepliesRef, loadListRef}}>
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
    </div>
  </DisplayToken>);
}

export function DisplayToken({ chainId, setSortSavers, disableSort, collection, tokenId, tokenURI, owner, unsortedCount, sortedCount, replyAddedTime, children, setChildRepliesRef, setChildForceShowRepliesRef, loadListRef }) {
  const [loadURI, setLoadURI] = useState(false);
  return (
    <div className="msg">
      <UserBadge address={owner} />
      {replyAddedTime && replyAddedTime > 0 && (
        <span className="postdate"> posted <Link to={`/nft/${chainId}/${collection}/${tokenId}`}>{remaining(Math.round(Date.now() / 1000) - replyAddedTime.toString(), true)} ago</Link></span>
      )}
      {tokenURI.startsWith('data:,') ? (
        <Linkify><div className="text">{decodeURIComponent(tokenURI.slice(6))}</div></Linkify>
      ) : loadURI ? (
        <iframe title="NFT display" src={tokenURI}></iframe>
      ) : (
        <div className="preload"><a href={tokenURI} onClick={(event) => {
          event.preventDefault();
          setLoadURI(true);
        }}>Load external resource: {tokenURI}</a></div>
      )}
      {children}
      <Replies {...{chainId, setSortSavers, disableSort, collection, tokenId, owner, unsortedCount, sortedCount, setChildRepliesRef, setChildForceShowRepliesRef, loadListRef}} />
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

function LinkComponent(decoratedHref, decoratedText, key) {
  return (<a href={decoratedHref} target="_blank" rel="noreferrer" key={key}>{decoratedText}</a>);
}
Linkify.defaultProps.componentDecorator = LinkComponent;
