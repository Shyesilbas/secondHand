import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import ListingCard from './ListingCard.jsx';
import { Sparkles, Compass } from 'lucide-react';
import { useAuthState } from '../../auth/AuthContext.jsx';

const SimilarListings = ({ currentListing }) => {
  const { user } = useAuthState();
  
  const { data, isLoading, error } = useQuery({
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
    return (
      <div className="border-t border-slate-100/80 pt-10 mt-10">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-500 animate-spin" />
          Finding Similar Listings...
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-100 p-3.5 space-y-3 animate-pulse">
              <div className="aspect-[4/3] bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data || data.length === 0) return null;

  return (
    <div className="border-t border-slate-100/80 pt-10 mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100/50">
            More to explore
          </span>
          <h3 className="text-[15px] font-extrabold text-slate-900 mt-2 flex items-center gap-2">
            Similar Listings
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map(listing => (
          <ListingCard
            key={listing.id}
            listing={listing}
            showActions={false}
            isOwner={user?.id === listing.sellerId}
            currentUserId={user?.id}
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarListings;
