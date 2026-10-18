import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ShowcaseButton from '../../showcase/components/ShowcaseButton.jsx';
import { FollowButton } from '../../follow/index.js';
import { useUserReviewStats } from '../../reviews/hooks/useReviews.js';
import { Award, Star, CheckCircle } from 'lucide-react';

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
 <div className="w-12 h-12 bg-primary rounded-md flex items-center justify-center text-sm font-semibold text-white">
 {listing.sellerName?.[0]?.toUpperCase() || 'U'}
 </div>
 <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-border">
 <CheckCircle className="w-3.5 h-3.5 text-text-primary fill-secondary-200" />
 </div>
 </div>

 <div className="min-w-0">
 <div className="flex items-center gap-1.5">
 <Link to={ROUTES.USER_PROFILE(listing.sellerId)} className="text-sm font-semibold text-text-primary hover:text-text-primary transition-colors truncate">
 {listing.sellerName} {listing.sellerSurname}
 </Link>
 </div>
 {listing.sellerAccountCreationDate && (
 <p className="text-xs text-text-muted font-medium mt-0.5">
 {t("member_since", "Üyelik Tarihi:")} {new Date(listing.sellerAccountCreationDate).getFullYear()}
 </p>
 )}
 </div>
 </div>
 {!isOwner && <FollowButton userId={listing.sellerId} size="sm" showDropdown={true} />}
 </div>

 {/* Dynamic Trust Ratings Metric Grid */}
 <div className="grid grid-cols-2 gap-2 py-3 px-2 rounded-md bg-background-secondary border border-border/80 text-center">
 <div className="border-r border-border/80">
 <div className="flex items-center justify-center gap-1">
 <Star className="w-3.5 h-3.5 text-status-warning fill-status-warning" />
 <span className="text-xs font-semibold text-text-primary">{ratingAvg.toFixed(1)}</span>
 </div>
 <span className="text-xs font-semibold text-text-muted block mt-0.5">{t("rating", "Puan")}</span>
 </div>
 <div>
 <span className="text-xs font-semibold text-text-primary">{reviewCount}</span>
 <span className="text-xs font-semibold text-text-muted block mt-0.5">{t("reviews", "Değerlendirme")}</span>
 </div>
 </div>

 {showGreatSeller && (
 <div className="flex items-center gap-2.5 p-3 bg-background-secondary/80 border border-border/80 rounded-md">
 <div className="p-1.5 rounded bg-background-secondary text-status-warning-text shrink-0">
 <Award className="w-4 h-4" />
 </div>
 <div>
 <span className="text-xs font-semibold text-status-warning-text block">{t("great_seller_status", "Harika Satıcı")}</span>
 <p className="text-xs text-status-warning-text/80 font-medium mt-0.5 leading-tight">{t("highly_rated_for_excellent_customer_resp", "Hızlı yanıt ve yüksek memnuniyet oranı")}</p>
 </div>
 </div>
 )}

 {!isOwner ? (
 <ContactSellerButton listing={listing} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-hover text-white rounded text-xs font-semibold transition-all cursor-pointer">
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
 <div className="border-t border-border-light pt-5 mt-5">
 <h3 className="text-xs font-semibold text-text-primary mb-3">{t("seller_information", "Satıcı Bilgileri")}</h3>
 <div className="bg-white border border-border/80 rounded-md p-4">
 {content}
 </div>
 </div>
 );
};

export default ListingTrustPanel;