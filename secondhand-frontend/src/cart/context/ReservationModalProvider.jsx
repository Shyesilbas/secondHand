import React, { useCallback, useState } from 'react';
import ReservationModal from '../components/ReservationModal.jsx';
import { ReservationModalContext } from './ReservationModalContext.jsx';

export const ReservationModalProvider = ({ children }) => {
    const [data, setData] = useState(null);
    const showReservationModal = useCallback((cartItem) => setData(cartItem), []);
    const close = useCallback(() => setData(null), []);

    return (
        <ReservationModalContext.Provider value={{ showReservationModal }}>
            {children}
            <ReservationModal isOpen={!!data} onClose={close} cartItem={data} />
        </ReservationModalContext.Provider>
    );
};
