import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ShowcaseButton from '../../showcase/components/ShowcaseButton.jsx';
import { FollowButton } from '../../follow/index.js';
import { useUserReviewStats } from '../../reviews/hooks/useReviews.js';
import { Award, ShieldCheck, Star, CheckCircle, ShieldAlert, QrCode, MapPin, Wallet } from 'lucide-react';
const ListingTrustPanel = ({
  listing,
  isOwner,
  onShowcaseSuccess
}) => {
  const {
    t
  } = useTranslation();
  const sellerId = listing?.sellerId;
  const {
    stats
  } = useUserReviewStats(sellerId, {
    enabled: !!sellerId
  });
  if (!listing) return null;
  const showGreatSeller = Boolean(listing.sellerGreatSellerEligible);
  const ratingAvg = stats?.averageRating ?? 5.0;
  const reviewCount = stats?.reviewCount ?? 0;
  return <>
      {/* Seller Card Redesign */}
      <div className="border-t border-slate-100 py-6 mb-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t("seller_information")}</h3>
        <div className="bg-slate-50/50 border border-slate-100/80 rounded-2xl p-4 mb-4 shadow-[0_2px_8px_-1px_rgba(15,23,42,0.01)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Avatar with Verified Ring */}
              <div className="relative">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm border border-slate-900/5">
                  {listing.sellerName?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-50">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-white" />
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link to={ROUTES.USER_PROFILE(listing.sellerId)} className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate">
                    {listing.sellerName} {listing.sellerSurname}
                  </Link>
                </div>
                {listing.sellerAccountCreationDate && <p className="text-xs text-slate-400 font-medium mt-0.5">{t("member_since")}{new Date(listing.sellerAccountCreationDate).getFullYear()}
                  </p>}
              </div>
            </div>
            {!isOwner && <FollowButton userId={listing.sellerId} size="sm" showDropdown={true} />}
          </div>

          {/* Dynamic Trust Ratings Panel */}
          <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-slate-100/60 my-4 text-center">
            <div className="border-r border-slate-100/60">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-slate-800">{ratingAvg.toFixed(1)}</span>
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-1">{t("rating")}</span>
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">{reviewCount}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mt-1">{t("reviews")}</span>
            </div>
          </div>

          {showGreatSeller && <div className="flex items-center gap-2 py-2 px-3 bg-amber-50/50 border border-amber-100/60 rounded-xl mb-4">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">{t("great_seller_status")}</span>
                <p className="text-xs text-amber-700/80 font-medium mt-0.5 leading-tight">{t("highly_rated_for_excellent_customer_resp")}</p>
              </div>
            </div>}

          {!isOwner ? <ContactSellerButton listing={listing} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95">{t("contact_seller")}</ContactSellerButton> : <ShowcaseButton listingId={listing.id} onSuccess={onShowcaseSuccess} />}
        </div>
      </div>
    </>;
};
export default ListingTrustPanel;