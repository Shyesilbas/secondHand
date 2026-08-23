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

 return <div onClick={handleClick} style={style} className={`w-80 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xl cursor-pointer transition-all duration-300 hover:border-slate-700 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 select-none group ${className}`}>
 <div className="relative aspect-video rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80 flex items-center justify-center">
 {listing.imageUrl ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="text-slate-400 text-xs font-semibold">{t("no_image")}</div>}
 <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
 <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
 <ShieldCheck className="w-3 h-3" />{t("verified")}</span>
 {isAuraApproved && <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-[10px] font-extrabold text-white uppercase tracking-wider shadow-sm flex items-center gap-1">
 <Sparkles className="w-3 h-3 text-amber-300" />{t("aura_pick")}</span>}
 </div>
 </div>

 <div className="mt-3 flex flex-col">
 <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
 {listing.type || 'Listing'}
 </span>
 <h4 className="text-sm font-bold text-slate-900 mt-1 truncate group-hover:text-slate-900 transition-colors">
 {listing.title}
 </h4>
 <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100">
 <span className="text-xs font-semibold text-slate-400">
 #{listing.listingNo}
 </span>
 <span className="text-sm font-black text-slate-900 ">
 {formatCurrency(listing.price, listing.currency)}
 </span>
 </div>
 </div>
 </div>;
};
export default HeroListingCard;