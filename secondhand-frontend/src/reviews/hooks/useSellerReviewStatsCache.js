import { useState, useEffect, useRef } from 'react';
import { reviewService } from '../services/reviewService.js';

const cache = new Map();
const pendingRequests = new Map();

export const useSellerReviewStatsCache = (sellerId) => {
    const [stats, setStats] = useState(cache.get(sellerId) || null);
    const [loading, setLoading] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!sellerId) {
            setStats(null);
            return;
        }

        if (cache.has(sellerId)) {
            setStats(cache.get(sellerId));
            return;
        }

        if (pendingRequests.has(sellerId)) {
            pendingRequests.get(sellerId).then((data) => {
                if (mountedRef.current) {
                    setStats(data);
                }
            }).catch(() => {
                if (mountedRef.current) {
                    setStats(null);
                }
            });
            return;
        }

        setLoading(true);
        const requestPromise = reviewService.getUserReviewStats(sellerId)
            .then((data) => {
                cache.set(sellerId, data);
                if (mountedRef.current) {
                    setStats(data);
                }
                return data;
            })
            .catch((err) => {
                console.error("Failed to fetch seller stats", err);
                if (mountedRef.current) {
                    setStats(null);
                }
                throw err;
            })
            .finally(() => {
                pendingRequests.delete(sellerId);
                if (mountedRef.current) {
                    setLoading(false);
                }
            });

        pendingRequests.set(sellerId, requestPromise);
    }, [sellerId]);

    return { stats, loading };
};

