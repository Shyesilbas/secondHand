import {useQuery} from '@tanstack/react-query';
import {userService} from '../services/userService.js';

const STALE_MS = 5 * 60 * 1000;

/** Public Great Seller rozeti verisi — listing detay ve profil paylaşımı. */
export function useGreatSellerStatus(userId, options = {}) {
    const enabled = Boolean(userId);
    return useQuery({
        queryKey: ['greatSellerStatus', userId],
        queryFn: () => userService.getGreatSellerStatus(userId),
        enabled,
        staleTime: STALE_MS,
        ...options,
    });
}
