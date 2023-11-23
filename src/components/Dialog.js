import {useRef, useEffect} from 'react';

export function Dialog({ show, children, button }) {
  const elRef = useRef();
  useEffect(() => {
    if(show && !elRef.current.open) elRef.current.showModal();
    else if(!show) elRef.current.close();
  }, [show]);
  return (<dialog ref={elRef}>
    {children}
    {button && <div className="button-list"><button type="button" onClick={() => elRef.current.close()}>{button}</button></div>}
  </dialog>);
}
