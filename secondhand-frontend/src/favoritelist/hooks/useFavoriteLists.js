import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteListService } from '../services/favoriteListService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { handleError } from '../../common/errorHandler.js';
import { extractSuccessMessage } from '../../common/successHandler.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useMyFavoriteLists = (page = 0, size = 5) => {
    const { user, isAuthenticated } = useAuth();
    return useQuery({
        queryKey: ['favoriteLists', 'my', user?.id, page, size],
        queryFn: () => favoriteListService.getMyLists(page, size),
        enabled: !!(isAuthenticated && user?.id),
        select: (res) => {
            if (Array.isArray(res)) return res;
            if (Array.isArray(res?.content)) return res.content;
            return [];
        },
        staleTime: 30000,
    });
};

export const useUserFavoriteLists = (userId, isOwnProfile = false, options = {}, page = 0, size = 5) => {
    return useQuery({
        queryKey: ['favoriteLists', 'user', userId, isOwnProfile, page, size],
        queryFn: () => isOwnProfile 
            ? favoriteListService.getMyLists(page, size) 
            : favoriteListService.getUserLists(userId, page, size),
        enabled: !!userId && (options.enabled !== false),
        select: (res) => {
            if (Array.isArray(res)) return res;
            if (Array.isArray(res?.content)) return res.content;
            return [];
        },
        staleTime: 60000,
    });
};

export const useFavoriteListById = (listId) => {
    return useQuery({
        queryKey: ['favoriteLists', listId],
        queryFn: () => favoriteListService.getListById(listId),
        enabled: !!listId,
        staleTime: 30000,
    });
};

export const usePopularLists = (page = 0, size = 10) => {
    return useQuery({
        queryKey: ['favoriteLists', 'popular', page, size],
        queryFn: () => favoriteListService.getPopularLists(page, size),
        staleTime: 60000,
    });
};

export const useListsContainingListing = (listingId) => {
    return useQuery({
        queryKey: ['favoriteLists', 'containing', listingId],
        queryFn: async () => {
            try {
                const result = await favoriteListService.getListsContainingListing(listingId);
                return result || { listIds: [] };
            } catch {
                return { listIds: [] };
            }
        },
        enabled: !!listingId,
        staleTime: 30000,
    });
};

export const useCreateFavoriteList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (data) => favoriteListService.createList(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'my', user?.id] });
            const msg = extractSuccessMessage(res);
            if (msg) showSuccess(null, msg);
        },
        onError: (error) => {
            handleError(error, showError);
        },
    });
};

export const useUpdateFavoriteList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ listId, data }) => favoriteListService.updateList(listId, data),
        onSuccess: (res, { listId }) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'my', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'user', user?.id, true] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', listId] });
            const msg = extractSuccessMessage(res);
            if (msg) showSuccess(null, msg);
        },
        onError: (error) => {
            handleError(error, showError);
        },
    });
};

export const useDeleteFavoriteList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    const { user } = useAuth();

    return useMutation({
        mutationFn: (listId) => favoriteListService.deleteList(listId),
        onSuccess: (res, listId) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'my', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'user', user?.id, true] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', listId] });
            const msg = extractSuccessMessage(res);
            if (msg) showSuccess(null, msg);
        },
        onError: (error) => {
            handleError(error, showError);
        },
    });
};

export const useAddItemToList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ listId, listingId, note }) => 
            favoriteListService.addItemToList(listId, listingId, note),
        onSuccess: (_, { listingId }) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'my', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'user', user?.id, true] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'containing', listingId] });
            // Success message backend'den Result.message ile gelebilir, burada ekstra mesaj göstermemek de yeterli
        },
        onError: (error) => {
            handleError(error, showError);
        },
    });
};

export const useRemoveItemFromList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();
    const { user } = useAuth();

    return useMutation({
        mutationFn: ({ listId, listingId }) => 
            favoriteListService.removeItemFromList(listId, listingId),
        onSuccess: (_, { listingId }) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'my', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'user', user?.id, true] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'containing', listingId] });
            // Success toast backend message'e bırakılabilir veya sessiz geçilebilir
        },
        onError: (error) => {
            handleError(error, showError);
        },
    });
};

export const useLikeFavoriteList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (listId) => favoriteListService.likeList(listId),
        onSuccess: (_, listId) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', listId] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'popular'] });
        },
    });
};

export const useUnlikeFavoriteList = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (listId) => favoriteListService.unlikeList(listId),
        onSuccess: (_, listId) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', listId] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'popular'] });
        },
    });
};

