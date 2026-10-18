import { useState, useEffect } from 'react';

const RESERVATION_TIMEOUT_MINUTES = 15;

export const useReservationTimer = (reservedAt, reservationEndTime) => {
 const [timeRemaining, setTimeRemaining] = useState(null);
 const [isExpired, setIsExpired] = useState(false);

 // A primitive timestamp keeps the effect from restarting the interval on every render.
 const endTime = reservationEndTime
 ? new Date(reservationEndTime).getTime()
 : reservedAt ? new Date(reservedAt).getTime() + RESERVATION_TIMEOUT_MINUTES * 60 * 1000 : null;

 useEffect(() => {
 if (!endTime) {
 setTimeRemaining(null);
 setIsExpired(false);
 return;
 }

 const calculateTimeRemaining = () => {
 const diff = endTime - Date.now();

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
