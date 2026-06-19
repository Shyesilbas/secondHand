import React, { createContext, useContext } from 'react';

export const ListingActionContext = createContext(null);

export const useListingActionContext = () => {
  return useContext(ListingActionContext);
};


