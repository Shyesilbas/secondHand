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

  return <div onClick={handleClick} style={style} className={`w-80 bg-white border border-slate-900/5 rounded-2xl p-4 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06),0_1px_3px_-1px_rgba(15,23,42,0.02)] cursor-pointer transition-all duration-300 hover:border-slate-200 hover:-translate-y-1 hover:shadow-[0_20px_35px_-10px_rgba(15,23,42,0.08)] select-none ${className}`}>
      <div className="relative aspect-video rounded-xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center">
        {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" /> : <div className="text-slate-300 text-xs font-semibold">{t("no_image")}</div>}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-0.5">
            <ShieldCheck className="w-2.5 h-2.5" />{t("verified")}</span>
          {isAuraApproved && <span className="px-2 py-0.5 rounded bg-indigo-600 text-[9px] font-bold text-white uppercase tracking-wider shadow-sm flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />{t("aura_pick")}</span>}
        </div>
      </div>

      <div className="mt-3 flex flex-col">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {listing.type || 'Listing'}
        </span>
        <h4 className="text-sm font-bold text-slate-900 mt-1 truncate group-hover:text-indigo-600 transition-colors">
          {listing.title}
        </h4>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
          <span className="text-xs font-semibold text-slate-400">
            #{listing.listingNo}
          </span>
          <span className="text-sm font-bold text-emerald-600 font-mono">
            {formatCurrency(listing.price, listing.currency)}
          </span>
        </div>
      </div>
    </div>;
};
export default HeroListingCard;