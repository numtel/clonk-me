import React, { useContext } from 'react';

import { DisplayTokens } from './DisplayToken.js';
import {SortSaveContext} from './SortSaver.js';

export function RootTokenList({chainId, tokens}) {
  const {setSortSavers, disableSort} = useContext(SortSaveContext);
  return (<>
    <DisplayTokens {...{chainId, setSortSavers, disableSort, tokens}} />
  </>);
}
