import React, {createContext, useCallback, useContext, useState} from 'react';
import ReservationModal from '../components/ReservationModal.jsx';

const ReservationModalContext = createContext({ showReservationModal: () => {} });

export const useReservationModal = () => useContext(ReservationModalContext);

export const ReservationModalProvider = ({children}) => {
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
