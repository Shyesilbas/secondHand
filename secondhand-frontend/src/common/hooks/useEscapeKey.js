import { useEffect } from 'react';

export const useEscapeKey = (onEscape, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    if (typeof onEscape !== 'function') return;

    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      onEscape(event);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onEscape, enabled]);
};

