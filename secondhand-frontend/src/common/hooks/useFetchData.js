/**
 * @deprecated Use React Query's useQuery instead.
 * This hook is kept for backward compatibility only.
 *
 * Example migration:
 *   const { data, isLoading, error, refetch } = useQuery({
 *     queryKey: ['myKey'],
 *     queryFn: fetchFunction,
 *   });
 */
import { useState, useEffect, useCallback } from 'react';

export const useFetchData = (fetchFunction) => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
                if (!fetchFunction) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await fetchFunction();
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, [fetchFunction]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refetch = fetchData;

    return { data, setData, isLoading, error, refetch };
};
