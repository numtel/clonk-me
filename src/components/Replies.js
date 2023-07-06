import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { erc721ABI, useNetwork, useSwitchNetwork, usePublicClient, useContractWrite, useWaitForTransaction, useAccount } from 'wagmi';

import { chainContracts } from '../contracts.js';
import { DisplayToken } from './DisplayToken.js';

const UNSORTED_PAGE_SIZE = 30n;
const SORTED_PAGE_SIZE = 30n;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export function Replies({ chainId, collection, tokenId, owner, unsortedCount, sortedCount }) {
  const contracts = chainContracts(chainId);
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const shouldSwitchChain = chain && Number(chainId) !== chain.id;
  const publicClient = usePublicClient({ chainId: Number(chainId) });
  const { address } = useAccount();
  const [setSortCalc, setSetSortCalc] = useState(false);
  const [disableSort, setDisableSort] = useState(false);
  const [forceShowReplies, setForceShowReplies] = useState(false);
  const [dirtyCount, setDirtyCount] = useState(0);
  // TODO these sorted/unsorted counts can drift from the prop values
  const [replies, setReplies] = useState([
    { id: 'loadSorted', el: (<button onClick={() => loadSorted()}>Load {sortedCount?.toString()} Sorted {sortedCount === 1n ? 'Reply' : 'Replies'}</button>) },
    { id: 'threshold', el: (<div className="threshold">Messages below this threshold are unsorted</div>) },
    { id: 'loadUnsorted', el: (<button onClick={() => loadUnsorted()}>Load {unsortedCount?.toString()} Unsorted {unsortedCount === 1n ? 'Reply' : 'Replies'}</button>) },
  ]);
  const { data:setSortData, isLoading:setSortLoading, isError:setSortError, isSuccess:setSortSuccess, write:setSortWrite } = useContractWrite({
    ...contracts.replies,
    functionName: 'setSort',
    onError() {
      setDisableSort(false);
    },
  });
  const { isError: txIsError, isLoading: txIsLoading, isSuccess: txIsSuccess } = useWaitForTransaction({
    hash: setSortData ? setSortData.hash : null,
    onSuccess(data) {
      setReplies((replies) => replies.map(reply => {
        if(reply.sorted && reply.dirty && !reply.aboveThreshold) {
          delete reply.sorted;
        }
        delete reply.dirty;
        return reply;
      }));
      setDirtyCount(0);
    },
    onSettled() {
      setDisableSort(false);
    },
  });
  const isOwner = address && address.toLowerCase() === owner?.toLowerCase();
  async function loadList(list) {
    const tokens = await publicClient.readContract({
      ...contracts.replies,
      functionName: 'convertInternalToTokens',
      args: [list],
    });
    const raw = await publicClient.multicall({
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
      ]).flat(),
    });
    return list.map((address, addrIndex) =>
      Object.assign({ address, id:address }, {
          key: `${tokens[addrIndex].collection}-${tokens[addrIndex].tokenId}`,
          chainId,
          collection: tokens[addrIndex].collection,
          tokenId: tokens[addrIndex].tokenId,
          tokenURI: raw[addrIndex * 4].result,
          owner: raw[addrIndex * 4 + 1].result,
          unsortedCount: raw[addrIndex * 4 + 2].result,
          sortedCount: raw[addrIndex * 4 + 3].result,
        }));
  }
  async function loadSorted(lastItem) {
    setReplies((replies) => [
      ...replies.filter(item => item.id !== 'loadSorted' && item.aboveThreshold),
      {
        id: 'loadSorted',
        el: (<div className="loading-replies">Loading sorted replies...</div>),
      },
      ...replies.filter(item => item.id !== 'loadSorted' && !item.aboveThreshold)
    ]);
    const fetchResult = await publicClient.readContract({
      ...contracts.replies,
      functionName: 'fetchSorted',
      args: [collection, tokenId, lastItem || ZERO_ADDRESS, SORTED_PAGE_SIZE, false]
    });
    const sorted = (await loadList(fetchResult)).map(item => {
      item.sorted = true;
      item.aboveThreshold = true;
      return item;
    });
    setReplies((replies) => {
      if(sorted.length > 0 && sorted.length === Number(SORTED_PAGE_SIZE)) {
        const nextStart = sorted[sorted.length - 1].address;
        sorted.push({ id: 'loadSorted', el: (<button onClick={() => loadSorted(nextStart)}>Load More sorted Replies</button>) });
      }
      const out = [ ...replies.filter(item => item.aboveThreshold), ...sorted, ...replies.filter(item => item.id !== 'loadSorted' && !item.aboveThreshold)];
      return out;
    });
  }
  async function loadUnsorted(lastScanned) {
    setReplies((replies) => [...replies.filter(item => item.id !== 'loadUnsorted'), {
        id: 'loadUnsorted',
        el: (<div className="loading-replies">Loading unsorted replies...</div>),
      }]);
    lastScanned = lastScanned || 0n;
    const fetchResult = await publicClient.readContract({
      ...contracts.replies,
      functionName: 'fetchUnsorted',
      args: [collection, tokenId, lastScanned, UNSORTED_PAGE_SIZE, true]
    });
    lastScanned = fetchResult[1] - fetchResult[2];
    const hasMore = fetchResult[2] > 0;
    const loaded = await loadList(fetchResult[0]);
    setReplies((replies) => {
      const out = [...replies.filter(item => item.id !== 'loadUnsorted'), ...loaded]
      if(hasMore) {
        out.push({ id: 'loadUnsorted', el: (<button onClick={() => loadUnsorted(lastScanned)}>Load More Unsorted Replies</button>) });
      }
      return out;
    });
  }

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  return (
    <div>
      {(unsortedCount > 0n || sortedCount > 0n || forceShowReplies) && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={replies}
            strategy={verticalListSortingStrategy}
          >
            {replies.map(item => <SortableItem key={item.id} isOwner={isOwner} id={item.id} data={item} />)}
          </SortableContext>
        </DndContext>
      )}
      {dirtyCount > 0 && (
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
    </div>
  );

  async function saveSort() {
    setDisableSort(true);
    setSetSortCalc(true);
    const dirtyGroups = [];
    let thisDirtySeq = null;
    let afterThreshold = false;
    for(let i=0; i<replies.length; i++) {
      if(replies[i].id === 'threshold') {
        afterThreshold = true;
      }
      if(replies[i].dirty) {
        if(!thisDirtySeq) {
          thisDirtySeq = {
            items: [ replies[i].address ],
            insertAfter: afterThreshold || i === 0 ? ZERO_ADDRESS : replies[i-1].address,
            afterThreshold,
          };
        } else {
          thisDirtySeq.items.push(replies[i].address);
        }
      } else {
        if(thisDirtySeq) {
          dirtyGroups.push(thisDirtySeq);
          thisDirtySeq = null;
        }
      }
    }
    if(thisDirtySeq) {
      dirtyGroups.push(thisDirtySeq);
    }
    const suggested = await publicClient.multicall({
      contracts: dirtyGroups.map(dirtyGroup => ({
        ...contracts.replies,
        functionName: 'suggestSorts',
        args: [collection, tokenId, dirtyGroup.insertAfter, dirtyGroup.items],
      })).filter(grp => grp.insertAfter !== null),
    });

    const ofItems = dirtyGroups.map((dirtyGroup, grpIndex) => dirtyGroup.items).flat();
    const sortValues = dirtyGroups.map((dirtyGroup, grpIndex) =>
      dirtyGroup.afterThreshold
        ? [...new Array(dirtyGroup.items.length)].map(x=>0n)
        : suggested[grpIndex].result).flat();
    setSetSortCalc(false);
    setSortWrite({
      args: [ collection, tokenId, ofItems, sortValues ],
    });
  }

  function handleDragEnd(event) {
    if(disableSort) return;
    const {active, over} = event;
    if(!over || !active) return;

    if (active.id !== over.id) {
      setReplies((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        let newIndex = items.findIndex(item => item.id === over.id);

        // If the sorted replies aren't loaded, you can only sort to the
        // very beginning
        if(newIndex === 1 && items[0].id === 'loadSorted') newIndex = 0;
        if(oldIndex === 0 && newIndex === 1 && items[1].id === 'loadSorted') newIndex = 0;

        const thresholdIndex = items.findIndex(item => item.id === 'threshold');

        if(oldIndex > thresholdIndex && newIndex > thresholdIndex) return items;
        const isNowAboveThreshold = oldIndex > thresholdIndex ? newIndex <= thresholdIndex : newIndex < thresholdIndex;
        items[oldIndex].dirty = true;
        if(!items[oldIndex].sorted && !isNowAboveThreshold) {
          items[oldIndex].dirty = false;
        }
        items[oldIndex].aboveThreshold = isNowAboveThreshold;
        setDirtyCount(items.reduce((out, cur) => out += cur.dirty ? 1 : 0, 0));
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
}

function SortableItem({ id, data, isOwner }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id});

  if(transform) {
    // Don't deform the item while dragging
    transform.scaleY = 1;
    transform.scaleX = 1;
  }
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`drag-item ${data.dirty ? 'dirty' : ''}`}>
      {data.el ? data.el : (<>
        {isOwner && <div {...attributes} {...listeners} className={`drag-handle`}>Handle</div>}
        <DisplayToken {...data} />
      </>)}
    </div>
  );
}

