import { useState, useEffect } from 'react';

const RESERVATION_TIMEOUT_MINUTES = 15;

export const useReservationTimer = (reservedAt, reservationEndTime) => {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    const endTime = reservationEndTime || (reservedAt && new Date(new Date(reservedAt).getTime() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000));

    useEffect(() => {
        if (!endTime) {
            setTimeRemaining(null);
            setIsExpired(false);
            return;
        }

        const calculateTimeRemaining = () => {
            const expirationTime = new Date(endTime);
            const now = new Date();
            const diff = expirationTime - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeRemaining(null);
                return;
            }

            setIsExpired(false);
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining({ minutes, seconds });
        };

        calculateTimeRemaining();
        const interval = setInterval(calculateTimeRemaining, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return { timeRemaining, isExpired, isReserved: !!endTime };
};
