import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

export const BLOCK_KEYS = Object.freeze({
  blockedUsers: ['users', 'blocked'],
  status: (userId) => ['users', 'block-status', String(userId)],
  settings: ['users', 'settings'],
});

export const useBlockStatus = (userId, { enabled = true } = {}) =>
  useQuery({
    queryKey: BLOCK_KEYS.status(userId),
    queryFn: () => userService.getBlockStatus(userId),
    enabled: Boolean(userId) && enabled,
    staleTime: 30 * 1000,
  });

export const useBlockedUsers = ({ enabled = true } = {}) =>
  useQuery({
    queryKey: BLOCK_KEYS.blockedUsers,
    queryFn: userService.getBlockedUsers,
    enabled,
  });

// A block changes what the viewer may see everywhere, so listings, chat and the profile all refetch.
const invalidateAfterBlockChange = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['users'] });
  queryClient.invalidateQueries({ queryKey: ['listings'] });
  queryClient.invalidateQueries({ queryKey: ['showcases'] });
  queryClient.invalidateQueries({ queryKey: ['chat'] });
  queryClient.invalidateQueries({ queryKey: ['chatRooms'] });
};

const useBlockMutation = (mutationFn, successMessage) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useNotification();
  return useMutation({
    mutationFn,
    onSuccess: (status, userId) => {
      queryClient.setQueryData(BLOCK_KEYS.status(userId), status);
      invalidateAfterBlockChange(queryClient);
      showSuccess('', successMessage);
    },
    onError: (err) => showError('', err?.response?.data?.message || 'İşlem tamamlanamadı.'),
  });
};

export const useBlockUser = () => useBlockMutation(userService.blockUser, 'Kullanıcı engellendi.');
export const useUnblockUser = () => useBlockMutation(userService.unblockUser, 'Engel kaldırıldı.');

export const useUserSettings = ({ enabled = true } = {}) =>
  useQuery({ queryKey: BLOCK_KEYS.settings, queryFn: userService.getSettings, enabled });

export const useUpdateUserSettings = () => {
  const queryClient = useQueryClient();
  const { showError } = useNotification();
  return useMutation({
    mutationFn: userService.updateSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(BLOCK_KEYS.settings, settings);
      queryClient.invalidateQueries({ queryKey: ['user', 'me'] });
    },
    onError: (err) => showError('', err?.response?.data?.message || 'Ayar kaydedilemedi.'),
  });
};
