import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import { ShieldCheck, Sparkles } from 'lucide-react';
const HeroListingCard = ({
 listing,
 style,
 className = ""
}) => {
 const {
 t
 } = useTranslation();
 const navigate = useNavigate();
 if (!listing) return null;
 const handleClick = () => {
 navigate(`${ROUTES.LISTINGS}/${listing.id}`);
 };

 // Determine dynamic badge
 const isAuraApproved = listing.price && listing.price < 150000; // Simulated algorithm for demo

 return <div onClick={handleClick} style={style} className={`w-80 bg-white border border-border/90 rounded-md p-4 shadow-md cursor-pointer transition-all duration-300 hover:border-secondary-700 select-none group ${className}`}>
 <div className="relative aspect-video rounded bg-background-tertiary overflow-hidden border border-border/80 flex items-center justify-center">
 {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500" /> : <div className="text-text-muted text-xs font-semibold">{t("no_image")}</div>}
 <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
 <span className="px-2.5 py-1 rounded bg-primary-hover/90 text-xs font-semibold text-white shadow-sm flex items-center gap-1">
 <ShieldCheck className="w-3 h-3" />{t("verified")}</span>
 {isAuraApproved && <span className="px-2.5 py-1 rounded bg-primary text-xs font-semibold text-white flex items-center gap-1">
 <Sparkles className="w-3 h-3 text-status-warning" />{t("aura_pick")}</span>}
 </div>
 </div>

 <div className="mt-3 flex flex-col">
 <span className="text-xs font-semibold text-text-muted">
 {listing.type || 'Listing'}
 </span>
 <h4 className="text-sm font-semibold text-text-primary mt-1 truncate group-hover:text-text-primary transition-colors">
 {listing.title}
 </h4>
 <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-light">
 <span className="text-xs font-semibold text-text-muted">
 #{listing.listingNo}
 </span>
 <span className="text-sm font-semibold text-text-primary ">
 {formatCurrency(listing.price, listing.currency)}
 </span>
 </div>
 </div>
 </div>;
};
export default HeroListingCard;