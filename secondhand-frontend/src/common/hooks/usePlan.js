import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {membershipService} from '../services/membershipService';
import {useAuthState} from '../../auth/AuthContext.jsx';

export const usePlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthState();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['membership', 'status'],
    queryFn: membershipService.getStatus,
    initialData: user?.plan ? { plan: user.plan, planExpiry: user.planExpiry } : undefined,
    staleTime: Infinity,
  });

  const cancelMutation = useMutation({
    mutationFn: membershipService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership', 'status'] });
    },
  });

  return {
    plan: data?.plan ?? 'FREE',
    isPremium: data?.isPremium ?? false,
    planExpiry: data?.planExpiry,
    dailyAuraUsage: data?.dailyAuraUsage ?? 0,
    dailyAuraLimit: data?.dailyAuraLimit ?? 4,
    aiListingQuota: data?.aiListingQuota ?? 1,
    maxShowcaseSlots: data?.maxShowcaseSlots ?? 1,
    estimatedShippingDays: data?.estimatedShippingDays ?? 3,
    orderProcessingSpeed: data?.orderProcessingSpeed ?? 'Standart',
    autoRenew: data?.autoRenew ?? false,
    isLoading,
    refetch,
    cancelSubscription: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
};
