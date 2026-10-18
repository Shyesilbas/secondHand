import { useEffect, useState } from 'react';

/** Returns `value` once it has stopped changing for `delay` ms. */
export const useDebouncedValue = (value, delay) => {
 const [debounced, setDebounced] = useState(value);
 useEffect(() => {
 const id = setTimeout(() => setDebounced(value), delay);
 return () => clearTimeout(id);
 }, [value, delay]);
 return debounced;
};
