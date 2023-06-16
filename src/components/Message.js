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
import { usePublicClient, useContractWrite, useWaitForTransaction, useAccount } from 'wagmi';

import { ReplyButton } from './Reply.js';
import { EditButton } from './Edit.js';
import UserBadge from './UserBadge.js';
import messageABI from '../abi/Message.json';
import { msgProps } from '../contracts.js';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// TODO Embed other messages [Msg chain:80001 0x2345...]
export function Message({ item, chainId }) {
  const publicClient = usePublicClient({ chainId });
  const { address } = useAccount();
  const isOwner = address && address.toLowerCase() === item.owner.toLowerCase();

  const [setSortCalc, setSetSortCalc] = useState(false);
  const [disableSort, setDisableSort] = useState(false);
  const [dirtyCount, setDirtyCount] = useState(0);
  const [replies, setReplies] = useState([
    { id: 'loadSorted', el: (<button onClick={loadSorted}>Load {item.sortedCount.toString()} Sorted {item.sortedCount === 1n ? 'Reply' : 'Replies'}</button>) },
    { id: 'threshold', el: (<div className="threshold">Messages below this threshold are unsorted</div>) },
    { id: 'loadUnsorted', el: (<button onClick={loadUnsorted}>Load {item.unsortedCount.toString()} Unsorted {item.unsortedCount === 1n ? 'Reply' : 'Replies'}</button>) },
  ]);
  const { data:setSortData, isLoading:setSortLoading, isError:setSortError, isSuccess:setSortSuccess, write:setSortWrite } = useContractWrite({
    address: item.address,
    abi: messageABI,
    chainId,
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
  async function loadItems(functionName, args, listFun) {
    let list = await publicClient.readContract({
      address: item.address,
      abi: messageABI,
      functionName,
      args,
    });
    if(listFun) list = listFun(list);
    const raw = await publicClient.multicall({
      contracts: list.map(address => msgProps.map(functionName => ({
        address,
        abi: messageABI,
        functionName,
      }))).flat(),
    });
    return list.map((address, addrIndex) =>
      msgProps.reduce((out, cur, index) => {
        out[cur] = raw[addrIndex * msgProps.length + index].result;
        return out;
      }, { address, chainId, id: address }));
  }
  async function loadSorted() {
    setReplies((replies) => [{
      id: 'loadSorted',
      el: (<div className="loading-replies">Loading sorted replies...</div>),
    },
    ...replies.filter(item => item.id !== 'loadSorted')]);
    // TODO pagination
    const sorted = (await loadItems('fetchSorted', [ZERO_ADDRESS, 10n])).map(item => {
      item.sorted = true;
      item.aboveThreshold = true;
      return item;
    });
    setReplies((replies) => [...sorted, ...replies.filter(item => item.id !== 'loadSorted' && !item.aboveThreshold)]);
  }
  async function loadUnsorted() {
    setReplies((replies) => [...replies.filter(item => item.id !== 'loadUnsorted'), {
        id: 'loadUnsorted',
        el: (<div className="loading-replies">Loading unsorted replies...</div>),
      }]);
    // TODO pagination
    const unsorted = await loadItems('fetchUnsorted', [0, 10n, false], list => list[0]);
    setReplies((replies) => [...replies.filter(item => item.id !== 'loadUnsorted' && (!item.address || item.aboveThreshold)), ...unsorted]);
  }

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="msg">
      <UserBadge address={item.owner} />
      <span className="postdate">Posted on <Link to={'/m/' + item.address}>{new Date(item.createdAt.toString() * 1000).toLocaleString()}</Link>{item.lastChanged > 0n && (<em className="edited" title={new Date(item.lastChanged.toString() * 1000).toLocaleString()}>Edited</em>)}</span>
      <div className="text">{item.message}</div>
      {item.parent !== ZERO_ADDRESS && <Link to={'/m/' + item.parent}><button>Parent</button></Link>}
      <ReplyButton address={item.address} chainId={chainId} />
      <EditButton item={item} chainId={chainId} />
      {(item.unsortedCount > 0n || item.sortedCount > 0n) && (
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
          : (<button onClick={saveSort}>Save Sort</button>)}
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
        address: item.address,
        abi: messageABI,
        functionName: 'suggestSorts',
        args: [dirtyGroup.insertAfter, dirtyGroup.items],
      })).filter(grp => grp.insertAfter !== null),
    });

    const ofItems = dirtyGroups.map((dirtyGroup, grpIndex) => dirtyGroup.items).flat();
    const sortValues = dirtyGroups.map((dirtyGroup, grpIndex) =>
      dirtyGroup.afterThreshold
        ? [...new Array(dirtyGroup.items.length)].map(x=>0n)
        : suggested[grpIndex].result).flat();
    setSetSortCalc(false);
    setSortWrite({
      args: [ ofItems, sortValues ],
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
        <Message chainId={data.chainId} item={data} />
      </>)}
    </div>
  );
}
