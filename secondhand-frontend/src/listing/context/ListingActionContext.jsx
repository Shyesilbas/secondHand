import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ListingActionContext = createContext(null);

export const ListingActionProvider = ({ children }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [activeListing, setActiveListing] = useState(null);

  const openAction = useCallback((action, listing) => {
    setActiveAction(action || null);
    setActiveListing(listing || null);
  }, []);

  const closeAction = useCallback(() => {
    setActiveAction(null);
    setActiveListing(null);
  }, []);

  const value = useMemo(
    () => ({
      activeAction,
      activeListing,
      openAction,
      closeAction,
    }),
    [activeAction, activeListing, closeAction, openAction]
  );

  return <ListingActionContext.Provider value={value}>{children}</ListingActionContext.Provider>;
};

export const useListingActionContext = () => {
  return useContext(ListingActionContext);
};

