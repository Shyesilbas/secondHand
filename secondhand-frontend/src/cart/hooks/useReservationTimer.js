import { useState, useEffect } from 'react';

const RESERVATION_TIMEOUT_MINUTES = 15;

export const useReservationTimer = (reservedAt) => {
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!reservedAt) {
            setTimeRemaining(null);
            setIsExpired(false);
            return;
        }

        const calculateTimeRemaining = () => {
            const reservedTime = new Date(reservedAt);
            const expirationTime = new Date(reservedTime.getTime() + (RESERVATION_TIMEOUT_MINUTES * 60 * 1000));
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
    }, [reservedAt]);

    return { timeRemaining, isExpired, isReserved: !!reservedAt };
};
