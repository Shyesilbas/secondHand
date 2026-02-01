import { useEffect } from 'react';

export const useClickOutside = (ref, onOutside, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    if (typeof onOutside !== 'function') return;

    const handleMouseDown = (event) => {
      const el = ref?.current;
      if (!el) return;
      if (el === event.target) return;
      if (el.contains(event.target)) return;
      onOutside(event);
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [ref, onOutside, enabled]);
};
