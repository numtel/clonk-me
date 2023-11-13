import {useState} from 'react';
import { chainContracts, methods } from '../contracts.js';
import { isAddressEqual, isAddress } from 'viem';

export function EditButton(props) {
  const contracts = chainContracts(props.chainId);
  const [show, setShow] = useState(false);

  for(let key of Object.keys(contracts)) {
    if(isAddress(contracts[key].address) && isAddressEqual(contracts[key].address, props.collection) && key in methods && methods[key].edit) {
      if(show) return methods[key].edit({...props, setShow});
      return (<button onClick={() => setShow(true)}>Edit</button>);
    }
  }
}
