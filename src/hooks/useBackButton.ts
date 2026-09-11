import { useEffect, useRef } from 'react';

export function useBackButton(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const isPoppingRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    isPoppingRef.current = false;
    window.history.pushState({ modalOpen: true }, '');

    const handlePopState = (e: PopStateEvent) => {
      isPoppingRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!isPoppingRef.current && window.history.state?.modalOpen) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
