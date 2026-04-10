import { useState, useEffect, useRef } from 'react';
import { reviewService } from '../services/reviewService.js';
import logger from '../../common/utils/logger.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_CACHE_ENTRIES = 64;

const cache = new Map();
const pendingRequests = new Map();

const cacheGet = (sellerId) => {
    const entry = cache.get(sellerId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(sellerId);
        return null;
    }
    return entry.data;
};

const cacheSet = (sellerId, data) => {
    if (cache.size >= MAX_CACHE_ENTRIES) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) cache.delete(firstKey);
    }
    cache.set(sellerId, { data, expiresAt: Date.now() + CACHE_TTL_MS });
};

export const useSellerReviewStatsCache = (sellerId) => {
    const [stats, setStats] = useState(() => (sellerId ? cacheGet(sellerId) : null));
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

        const cached = cacheGet(sellerId);
        if (cached !== null) {
            setStats(cached);
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
                cacheSet(sellerId, data);
                if (mountedRef.current) {
                    setStats(data);
                }
                return data;
            })
            .catch((err) => {
                logger.error("Failed to fetch seller stats", err);
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

