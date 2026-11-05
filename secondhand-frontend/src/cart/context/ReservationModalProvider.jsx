import { useCallback, useMemo, useState } from 'react';
import ReservationModal from '../components/ReservationModal.jsx';
import { ReservationModalContext } from './ReservationModalContext.jsx';

export const ReservationModalProvider = ({ children }) => {
 const [data, setData] = useState(null);
 const showReservationModal = useCallback((cartItem) => setData(cartItem), []);
 const close = useCallback(() => setData(null), []);
 const value = useMemo(() => ({ showReservationModal }), [showReservationModal]);

 return (
 <ReservationModalContext.Provider value={value}>
 {children}
 {data && <ReservationModal isOpen={!!data} onClose={close} cartItem={data} />}
 </ReservationModalContext.Provider>
 );
};
