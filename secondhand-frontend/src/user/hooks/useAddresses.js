import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService.js';

export const ADDRESSES_QUERY_KEYS = {
  all: ['addresses'],
};

const useAddresses = (options = {}) => {
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;

  const {
    data: addresses = [],
    isLoading: loading,
    error,
    refetch: fetchAddresses,
  } = useQuery({
    queryKey: ADDRESSES_QUERY_KEYS.all,
    queryFn: userService.getAddresses,
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const addAddressMutation = useMutation({
    mutationFn: (address) => userService.addAddress(address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEYS.all });
    }
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, address }) => userService.updateAddress(id, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEYS.all });
    }
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id) => userService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEYS.all });
    }
  });

  const selectMainAddressMutation = useMutation({
    mutationFn: (id) => userService.selectMainAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEYS.all });
    }
  });

  return {
    addresses,
    loading: loading || addAddressMutation.isPending || updateAddressMutation.isPending || deleteAddressMutation.isPending || selectMainAddressMutation.isPending,
    error: error?.message || null,
    fetchAddresses,
    addAddress: (address) => addAddressMutation.mutateAsync(address),
    updateAddress: (id, address) => updateAddressMutation.mutateAsync({ id, address }),
    deleteAddress: (id) => deleteAddressMutation.mutateAsync(id),
    selectMainAddress: (id) => selectMainAddressMutation.mutateAsync(id),
  };
};

export default useAddresses;
