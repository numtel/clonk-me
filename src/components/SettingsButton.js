import {useState, useContext} from 'react';
import {Dialog} from './Dialog.js';

import {byChain} from '../contracts.js';
import {DefaultChainContext} from '../Router.js';

export const CHAINS_DISABLED_LOCALSTORAGE_KEY = 'chainsDisabled';
export const MIMES_ENABLED_LOCALSTORAGE_KEY = 'mimesEnabled';
export const DEFAULT_CHAIN_LOCALSTORAGE_KEY = 'defaultChain';

const MIMES = [
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'audio/mpeg',
  'audio/ogg',
  'audio/webm',
  'audio/midi',
  'audio/x-midi',
  'video/mp4',
  'video/mpeg',
  'video/ogg',
  'video/webm',
];

export function SettingsButton({mimesEnabled, setMimesEnabled, chainsDisabled, setChainsDisabled}) {
  const [, setDefaultChain] = useContext(DefaultChainContext);
  const [show, setShow] = useState(false);
  const defaultChain = localStorage.getItem(DEFAULT_CHAIN_LOCALSTORAGE_KEY);

  function chainsChange(event) {
    event.preventDefault();
    const inputDisabled = Array.from(event.target.childNodes)
      .map(node => !node.selected ? node.value : null)
      .filter(x => x !== null);
    setChainsDisabled(() => inputDisabled);
    localStorage.setItem(CHAINS_DISABLED_LOCALSTORAGE_KEY, JSON.stringify(inputDisabled));
  }

  function mimesChange(event) {
    event.preventDefault();
    const inputEnabled = Array.from(event.target.childNodes)
      .map(node => node.selected ? node.value : null)
      .filter(x => x !== null);
    setMimesEnabled(() => inputEnabled);
    localStorage.setItem(MIMES_ENABLED_LOCALSTORAGE_KEY, JSON.stringify(inputEnabled));
  }

  function defaultChange(event) {
    event.preventDefault();
    setDefaultChain(() => event.target.value);
    localStorage.setItem(DEFAULT_CHAIN_LOCALSTORAGE_KEY, event.target.value);
  }

  return (<>
    <button title="Settings" className="rk" onClick={() => setShow(!show)} type="button">
      <span className="material-symbols-outlined">
        settings
      </span>
    </button>
    <Dialog {...{show}}>
      <div className="field">
        <label htmlFor="defaultChainSel">Default chain</label>
        <select id="defaultChainSel" onChange={defaultChange}>
          {Object.keys(byChain).map(chain => (
            <option key={chain} value={chain} selected={Number(defaultChain) === Number(chain)}>{byChain[chain].name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="chainSel">Display chains</label>
        <select id="chainSel" multiple onChange={chainsChange}>
          {Object.keys(byChain).map(chain => (
            <option key={chain} value={chain} selected={!chainsDisabled.includes(chain)}>{byChain[chain].name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="mimeSel">Auto-display mime types</label>
        <select id="mimeSel" multiple onChange={mimesChange}>
          {MIMES.map(mime => (
            <option key={mime} value={mime} selected={mimesEnabled.includes(mime)}>{mime}</option>
          ))}
        </select>
      </div>
      <p></p>
      <button onClick={() => setShow(false)}>Close</button>
    </Dialog>
  </>);
}
