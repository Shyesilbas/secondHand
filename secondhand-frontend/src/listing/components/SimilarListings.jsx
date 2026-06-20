import { useTranslation } from "react-i18next";
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import ListingCard from './ListingCard.jsx';
import { Sparkles, Compass } from 'lucide-react';
import { SkeletonGrid } from '../../common/components/ui/index.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
const SimilarListings = ({
  currentListing
}) => {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthState();
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey: ['similarListings', currentListing.id, currentListing.type, currentListing.city],
    queryFn: async () => {
      // Build filters based on the active listing
      const filters = {
        type: currentListing.type,
        listingType: currentListing.type,
        city: currentListing.city || null,
        status: 'ACTIVE',
        page: 0,
        size: 10 // Fetch slightly more to filter out current listing manually
      };
      try {
        const response = await listingService.filterListings(filters);
        const list = response?.content || [];
        // Filter out current listing and limit to 4
        return list.filter(item => item.id !== currentListing.id).slice(0, 4);
      } catch (err) {
        console.error('Failed to fetch similar listings', err);
        return [];
      }
    },
    enabled: !!currentListing?.id && !!currentListing?.type,
    staleTime: 5 * 60 * 1000 // 5 minutes cache
  });
  if (isLoading) {
    return <div className="border-t border-slate-100/80 pt-10 mt-10">
        <h3 className="text-sm font-medium text-text-primary mb-6 flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary animate-spin" />{t("finding_similar_listings")}</h3>
        <SkeletonGrid count={4} columns="grid-cols-2 md:grid-cols-4 gap-4" />
      </div>;
  }
  if (error || !data || data.length === 0) return null;
  return <div className="border-t border-slate-100/80 pt-10 mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-caption font-bold uppercase tracking-wider text-primary bg-indigo-50 px-2.5 py-1 rounded-full border border-primary/50">{t("more_to_explore")}</span>
          <h3 className="text-sm font-medium text-text-primary mt-2 flex items-center gap-2">{t("similar_listings")}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(listing => <ListingCard key={listing.id} listing={listing} showActions={false} isOwner={user?.id === listing.sellerId} currentUserId={user?.id} />)}
      </div>
    </div>;
};
export default SimilarListings;