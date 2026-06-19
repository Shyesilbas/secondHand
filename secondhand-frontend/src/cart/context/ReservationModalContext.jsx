import React, {createContext, useContext} from 'react';

export const ReservationModalContext = createContext({ showReservationModal: () => {} });

export const useReservationModal = () => useContext(ReservationModalContext);

