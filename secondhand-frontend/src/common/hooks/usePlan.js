import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {membershipService} from '../services/membershipService';
import {useAuthState} from '../../auth/AuthContext.jsx';

export const usePlan = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthState();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['membership', 'status'],
    queryFn: membershipService.getStatus,
    initialData: user?.plan ? { 
      plan: user.plan, 
      planExpiry: user.planExpiry,
      isPremium: user.plan === 'PREMIUM'
    } : undefined,
    staleTime: Infinity,
  });

  const cancelMutation = useMutation({
    mutationFn: membershipService.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const toggleAutoRenewMutation = useMutation({
    mutationFn: membershipService.toggleAutoRenew,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  return {
    plan: data?.plan ?? 'FREE',
    isPremium: data?.isPremium ?? false,
    purchaseDate: data?.purchaseDate,
    expirationDate: data?.expirationDate ?? data?.planExpiry,
    price: data?.price ?? 0,
    benefits: data?.benefits ?? [],
    status: data?.status ?? (data?.isPremium ? 'ACTIVE' : 'EXPIRED'),
    dailyAuraUsage: data?.dailyAuraUsage ?? 0,
    dailyAuraLimit: data?.dailyAuraLimit ?? (data?.isPremium ? 8 : 2),
    maxShowcaseSlots: data?.maxShowcaseSlots ?? (data?.isPremium ? 4 : 1),
    estimatedShippingDays: data?.estimatedShippingDays ?? (data?.isPremium ? 1 : 3),
    orderProcessingSpeed: data?.orderProcessingSpeed ?? (data?.isPremium ? '%50 Daha Hızlı' : 'Standart'),
    autoRenew: data?.autoRenew ?? false,
    isLoading,
    refetch,
    cancelSubscription: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    toggleAutoRenew: toggleAutoRenewMutation.mutate,
    isTogglingAutoRenew: toggleAutoRenewMutation.isPending,
    
    // Configurations
    freeMaxShowcaseSlots: data?.freeMaxShowcaseSlots ?? 1,
    premiumMaxShowcaseSlots: data?.premiumMaxShowcaseSlots ?? 4,
    freeDailyAuraLimit: data?.freeDailyAuraLimit ?? 2,
    premiumDailyAuraLimit: data?.premiumDailyAuraLimit ?? 8,
    freeEstimatedShippingDays: data?.freeEstimatedShippingDays ?? 3,
    premiumEstimatedShippingDays: data?.premiumEstimatedShippingDays ?? 1,
    freeOrderProcessingSpeed: data?.freeOrderProcessingSpeed ?? 'Standart',
    premiumOrderProcessingSpeed: data?.premiumOrderProcessingSpeed ?? '%50 Daha Hızlı'
  };
};
