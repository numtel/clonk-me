import {useState} from 'react';
import { chainContracts, methods } from '../contracts.js';
import { isAddressEqual, isAddress } from 'viem';

export function EditButton(props) {
  const contracts = chainContracts(props.chainId);
  const [show, setShow] = useState(false);

  for(let key of Object.keys(contracts)) {
    if(isAddress(contracts[key].address) && isAddressEqual(contracts[key].address, props.collection) && key in methods && methods[key].edit) {
      return (<>
        <button onClick={() => setShow(!show)}>Edit</button>
        {show && methods[key].edit({...props, setShow})}
      </>);
    }
  }
}
