import { useEffect, useRef, useState } from 'react';

export const useHeaderScroll = (threshold = 20) => {
  const [scrolled, setScrolled] = useState(false);
  const rafIdRef = useRef(null);
  const debounceIdRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const update = () => {
      rafIdRef.current = null;
      const next = lastScrollYRef.current > threshold;

      if (debounceIdRef.current) {
        clearTimeout(debounceIdRef.current);
      }

      debounceIdRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setScrolled((prev) => (prev === next ? prev : next));
      }, 60);
    };

    const onScroll = () => {
      lastScrollYRef.current = window.scrollY || 0;
      if (rafIdRef.current != null) return;
      rafIdRef.current = requestAnimationFrame(update);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      mountedRef.current = false;
      window.removeEventListener('scroll', onScroll);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      if (debounceIdRef.current) clearTimeout(debounceIdRef.current);
    };
  }, [threshold]);

  return scrolled;
};

