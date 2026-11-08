import { useTranslation } from "react-i18next";
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import ListingCard from './ListingCard.jsx';
import Skeleton, { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
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
 return <section className="border-t border-border-light pt-8" aria-busy="true">
 <Skeleton className="mb-4 h-6 w-40" />
 <SkeletonGrid count={4} columns="grid-cols-2 md:grid-cols-4 gap-4" />
 </section>;
 }
 if (error || !data || data.length === 0) return null;
 return <section className="border-t border-border-light pt-8" aria-labelledby="similar-listings-title">
 <div className="mb-4 flex items-center justify-between gap-4">
 <h2 id="similar-listings-title" className="text-lg font-semibold text-text-primary">{t("similar_listings", "Benzer ilanlar")}</h2>
 </div>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 {data.map(listing => <ListingCard key={listing.id} listing={listing} showActions={false} isOwner={user?.id === listing.sellerId} currentUserId={user?.id} />)}
 </div>
 </section>;
};
export default SimilarListings;