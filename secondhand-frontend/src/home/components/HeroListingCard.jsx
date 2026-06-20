import { useTranslation } from "react-i18next";
import React from 'react';
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

  return <div onClick={handleClick} style={style} className={`w-80 bg-background-primary border border-border-light rounded-xl p-4 shadow-sm cursor-pointer transition-all duration-300 hover:border-border hover:-translate-y-1 hover:shadow-md select-none ${className}`}>
      <div className="relative aspect-video rounded-lg bg-background-secondary overflow-hidden border border-border-light flex items-center justify-center">
        {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" /> : <div className="text-text-muted text-xs font-semibold">{t("no_image")}</div>}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className="px-2 py-0.5 rounded bg-status-success-bg text-caption font-bold text-status-success-text uppercase tracking-wider shadow-sm flex items-center gap-0.5">
            <ShieldCheck className="w-2.5 h-2.5" />{t("verified")}</span>
          {isAuraApproved && <span className="px-2 py-0.5 rounded bg-primary text-caption font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />{t("aura_pick")}</span>}
        </div>
      </div>

      <div className="mt-3 flex flex-col">
        <span className="text-caption font-bold text-text-muted uppercase tracking-wider">
          {listing.type || 'Listing'}
        </span>
        <h4 className="text-sm font-bold text-text-primary mt-1 truncate group-hover:text-primary transition-colors">
          {listing.title}
        </h4>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border-light">
          <span className="text-xs font-semibold text-text-muted">
            #{listing.listingNo}
          </span>
          <span className="text-sm font-bold text-status-success font-mono">
            {formatCurrency(listing.price, listing.currency)}
          </span>
        </div>
      </div>
    </div>;
};
export default HeroListingCard;