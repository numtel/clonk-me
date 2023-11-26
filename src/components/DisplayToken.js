import React, { useState, useRef, useEffect, useContext } from 'react';
import { erc721ABI, useContractReads, useAccount } from 'wagmi';
import { isAddressEqual, isAddress } from 'viem';
import { Link, useLocation } from 'react-router-dom';

import { chainContracts, convertToInternal } from '../contracts.js';
import { MinimizedContext } from '../Router.js';
import { MimesEnabledContext, BlockedContext } from './Layout.js';
import UserBadge from './UserBadge.js';
import { Replies } from './Replies.js';
import { ReplyButton } from './ReplyButton.js';
import { EditButton } from './EditButton.js';
import { ParentButton } from './ParentButton.js';
import { TransferButton } from './Transfer.js';
import { TruncateText } from './TruncateText.js';

export function DisplayTokens({ chainId, tokens, maxWords, setSortSavers, disableSort }) {
  const blocked = useContext(BlockedContext);
  const contracts = chainContracts(chainId);
  const QUERY_PER_TOKEN = 6;
  const { data, isError, isLoading } = useContractReads({
    contracts: tokens.map(token => [
      {
        chainId,
        address: token.collection,
        abi: erc721ABI,
        functionName: 'tokenURI',
        // Don't load blocked content
        args: [(blocked === null || (blocked && chainId in blocked &&
                token.collection in blocked[chainId] &&
                blocked[chainId][token.collection].includes(String(token.tokenId)))) ?
                  null : token.tokenId],
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
      key={`${chainId}${index}`}
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
  collection = String(collection).toLowerCase();
  const contracts = chainContracts(chainId);
  const mimesEnabled = useContext(MimesEnabledContext);
  const [allMinimized, setAllMinimized] = useContext(MinimizedContext);
  // If the token doesn't load, a new Symbol will never exist in mimesEnabled
  const mimeType = tokenURI ? tokenURI.split(';')[0].slice(5) : Symbol();
  const [loadURI, setLoadURI] = useState(mimesEnabled.includes(mimeType));
  const location = useLocation();
  const minimize = allMinimized &&
        (location.key in allMinimized) &&
        (chainId in allMinimized[location.key]) &&
        (collection in allMinimized[location.key][chainId]) &&
        (tokenId in allMinimized[location.key][chainId][collection]) ?
      allMinimized[location.key][chainId][collection][tokenId] : false;
  const setMinimize = (newVal) => {
    setAllMinimized(curVal => {
      curVal = curVal || {};
      curVal[location.key] = curVal[location.key] || {};
      curVal[location.key][chainId] = curVal[location.key][chainId] || {};
      curVal[location.key][chainId][collection] = curVal[location.key][chainId][collection] || {};
      curVal[location.key][chainId][collection][tokenId] = newVal;
      return {...curVal};
    });
  }
  if(editedTokenURI !== null) tokenURI = editedTokenURI;
  if(!tokenURI) return null;
  const msgBody = (<>
    <div className="header">
      {!isAddress(replyAddedAccount) || isAddressEqual(replyAddedAccount, owner) ? (<UserBadge address={owner} curChain={chainId} />) : (<span className="different-owner">
        <span className="original"><UserBadge address={replyAddedAccount} curChain={chainId} /></span>
        <span className="current"><UserBadge address={owner} curChain={chainId} /></span>
      </span>)}
      {replyAddedTime && replyAddedTime > 0 && (
        <span className="postdate"> posted <Link to={`/nft/${chainId}/${collection}/${tokenId}`}>{remaining(Math.round(Date.now() / 1000) - replyAddedTime.toString(), true, replyAddedTime)}</Link></span>
      )}
      <span className="small-controls">
        <Link target="_blank" rel="noreferrer" to={`${contracts.explorer}token/${collection}?a=${tokenId}`} title="View on Explorer" className="external">
          <span className="material-symbols-outlined">
            open_in_new
          </span>
        </Link>
        <button className="minimize link icon" title={minimize ? 'Show Message' : 'Hide Message'} onClick={() => setMinimize(!minimize)}>
          <span className="material-symbols-outlined">
            {minimize ? 'top_panel_open' : 'top_panel_close'}
          </span>
        </button>
      </span>
    </div>
    {tokenURI.startsWith('data:,') ? (
      <div className="text"><TruncateText text={decodeURIComponent(tokenURI.slice(6))} maxWords={maxWords || 50}></TruncateText></div>
    ) : loadURI ? (
      <iframe title="NFT display" src={tokenURI}></iframe>
    ) : tokenURI.startsWith('data:') ? (
      <div className="preload"><a href={tokenURI} onClick={(event) => {
        event.preventDefault();
        setLoadURI(true);
      }}>Display embedded resource: {mimeType}</a></div>
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
    <div className={`msg ${minimize ? 'minimize' : ''}`}>
      {msgBody}
    </div>
  );
}

export function remaining(seconds, onlyFirst, timestamp) {
  const units = [
    { value: 1, unit: 'second' },
    { value: 60, unit: 'minute' },
    { value: 60 * 60, unit: 'hour' },
    { value: 60 * 60 * 24, unit: 'day' },
    // Relative dates are not useful past a certain point, 10 days ago max
    { value: 60 * 60 * 24 * 11, unit: null },
  ];
  let remaining = Number(seconds);
  let out = [];
  for(let i = units.length - 1; i >= 0;  i--) {
    if(remaining >= units[i].value) {
      if(units[i].unit === null)
        return (new Date(Number(timestamp * 1000n))).toLocaleString();
      const count = Math.floor(remaining / units[i].value);
      out.push(count.toString(10) + ' ' + units[i].unit + (count !== 1 ? 's' : ''));
      if(onlyFirst) break;
      remaining = remaining - (count * units[i].value);
    }
  }
  return out.join(', ') + ' ago';
}



