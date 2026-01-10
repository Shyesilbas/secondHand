import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteListService } from '../services/favoriteListService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

export const useMyFavoriteLists = () => {
    return useQuery({
        queryKey: ['favoriteLists', 'my'],
        queryFn: () => favoriteListService.getMyLists(),
        staleTime: 30000,
    });
};

export const useUserFavoriteLists = (userId, isOwnProfile = false, options = {}) => {
    return useQuery({
        queryKey: ['favoriteLists', 'user', userId, isOwnProfile],
        queryFn: () => isOwnProfile 
            ? favoriteListService.getMyLists() 
            : favoriteListService.getUserLists(userId),
        enabled: !!userId && (options.enabled !== false),
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

    return useMutation({
        mutationFn: (data) => favoriteListService.createList(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'my'] });
            showSuccess('Başarılı', 'Liste oluşturuldu!');
        },
        onError: (error) => {
            showError('Hata', error.response?.data?.message || 'Liste oluşturulamadı');
        },
    });
};

export const useUpdateFavoriteList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();

    return useMutation({
        mutationFn: ({ listId, data }) => favoriteListService.updateList(listId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists'] });
            showSuccess('Başarılı', 'Liste güncellendi!');
        },
        onError: (error) => {
            showError('Hata', error.response?.data?.message || 'Liste güncellenemedi');
        },
    });
};

export const useDeleteFavoriteList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();

    return useMutation({
        mutationFn: (listId) => favoriteListService.deleteList(listId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists'] });
            showSuccess('Başarılı', 'Liste silindi!');
        },
        onError: (error) => {
            showError('Hata', error.response?.data?.message || 'Liste silinemedi');
        },
    });
};

export const useAddItemToList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();

    return useMutation({
        mutationFn: ({ listId, listingId, note }) => 
            favoriteListService.addItemToList(listId, listingId, note),
        onSuccess: (_, { listingId }) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists'] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'containing', listingId] });
            showSuccess('Başarılı', 'Ürün listeye eklendi!');
        },
        onError: (error) => {
            showError('Hata', error.response?.data?.message || 'Ürün eklenemedi');
        },
    });
};

export const useRemoveItemFromList = () => {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useNotification();

    return useMutation({
        mutationFn: ({ listId, listingId }) => 
            favoriteListService.removeItemFromList(listId, listingId),
        onSuccess: (_, { listingId }) => {
            queryClient.invalidateQueries({ queryKey: ['favoriteLists'] });
            queryClient.invalidateQueries({ queryKey: ['favoriteLists', 'containing', listingId] });
            showSuccess('Başarılı', 'Ürün listeden çıkarıldı!');
        },
        onError: (error) => {
            showError('Hata', error.response?.data?.message || 'Ürün çıkarılamadı');
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

