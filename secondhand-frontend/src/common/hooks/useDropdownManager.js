import { useCallback, useMemo, useState } from 'react';
import { useEscapeKey } from './useEscapeKey.js';

export const useDropdownManager = () => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const isOpen = useCallback((name) => openDropdown != null && openDropdown === name, [openDropdown]);

  const closeAll = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const close = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  const toggle = useCallback((dropdownName) => {
    if (!dropdownName) return;
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  }, []);

  useEscapeKey(closeAll, openDropdown != null);

  return useMemo(
    () => ({
      openDropdown,
      toggle,
      close,
      closeAll,
      isOpen,
    }),
    [openDropdown, toggle, close, closeAll, isOpen]
  );
};

