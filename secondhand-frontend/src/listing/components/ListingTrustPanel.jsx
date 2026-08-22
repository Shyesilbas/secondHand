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
  onShowcaseSuccess,
  flat = false
}) => {
  const { t } = useTranslation();
  const sellerId = listing?.sellerId;
  const { stats } = useUserReviewStats(sellerId, {
    enabled: !!sellerId
  });

  if (!listing) return null;
  const showGreatSeller = Boolean(listing.sellerGreatSellerEligible);
  const ratingAvg = stats?.averageRating ?? 5.0;
  const reviewCount = stats?.reviewCount ?? 0;

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar with Verified Badge */}
          <div className="relative shrink-0">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-sm font-extrabold text-white shadow-xs">
              {listing.sellerName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs border border-slate-200">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-50" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link to={ROUTES.USER_PROFILE(listing.sellerId)} className="text-sm font-extrabold text-slate-900 hover:text-emerald-700 transition-colors truncate">
                {listing.sellerName} {listing.sellerSurname}
              </Link>
            </div>
            {listing.sellerAccountCreationDate && (
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {t("member_since", "Üyelik Tarihi:")} {new Date(listing.sellerAccountCreationDate).getFullYear()}
              </p>
            )}
          </div>
        </div>
        {!isOwner && <FollowButton userId={listing.sellerId} size="sm" showDropdown={true} />}
      </div>

      {/* Dynamic Trust Ratings Metric Grid */}
      <div className="grid grid-cols-2 gap-2 py-3 px-2 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
        <div className="border-r border-slate-200/80">
          <div className="flex items-center justify-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="text-xs font-extrabold font-mono text-slate-900">{ratingAvg.toFixed(1)}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">{t("rating", "Puan")}</span>
        </div>
        <div>
          <span className="text-xs font-extrabold font-mono text-slate-900">{reviewCount}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">{t("reviews", "Değerlendirme")}</span>
        </div>
      </div>

      {showGreatSeller && (
        <div className="flex items-center gap-2.5 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl">
          <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 block">{t("great_seller_status", "Harika Satıcı")}</span>
            <p className="text-[11px] text-amber-800/80 font-medium mt-0.5 leading-tight">{t("highly_rated_for_excellent_customer_resp", "Hızlı yanıt ve yüksek memnuniyet oranı")}</p>
          </div>
        </div>
      )}

      {!isOwner ? (
        <ContactSellerButton listing={listing} className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer">
          {t("contact_seller", "Satıcıya Mesaj Gönder")}
        </ContactSellerButton>
      ) : (
        <ShowcaseButton listingId={listing.id} onSuccess={onShowcaseSuccess} />
      )}
    </div>
  );

  if (flat) {
    return content;
  }

  return (
    <div className="border-t border-slate-100 pt-5 mt-5">
      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-3">{t("seller_information", "Satıcı Bilgileri")}</h3>
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        {content}
      </div>
    </div>
  );
};

export default ListingTrustPanel;