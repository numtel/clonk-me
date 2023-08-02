import {useRef, useEffect} from 'react';

export function Dialog({ show, children }) {
  const elRef = useRef();
  useEffect(() => {
    if(show && !elRef.current.open) elRef.current.showModal();
    else if(!show) elRef.current.close();
  }, [show]);
  return (<dialog ref={elRef}>{children}</dialog>);
}
