import React from 'react';
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from 'framer-motion';
import ListingCardActions from '../../listing/components/ListingCardActions.jsx';
import { formatPaymentAmount } from '../utils/formatPaymentAmount.js';

const DraftListingsList = ({
 listings = [],
 selectedListing,
 onSelectListing,
 onListingChanged
}) => {
 const { t } = useTranslation();

 return (
 <div className="lg:col-span-7 xl:col-span-7 space-y-4">
 {/* Section Header */}
 <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
 <div>
 <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
 <span>{t("draft_listings")}</span>
 <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200/80 text-slate-900 border border-slate-300/60">
 {listings.length}
 </span>
 </h2>
 <p className="text-xs text-slate-500 mt-0.5">
 {t("choose_a_listing_to_pay_the_listing_fee")}
 </p>
 </div>
 </div>

 {/* Draft Item Cards */}
 <div className="space-y-3">
 <AnimatePresence mode="popLayout">
 {listings.map((listing, index) => {
 const isSelected = selectedListing?.id === listing.id;

 return (
 <motion.div
 key={listing.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ duration: 0.25, delay: index * 0.04 }}
 onClick={() => onSelectListing(listing)}
 className={`group relative rounded-2xl p-4 cursor-pointer transition-all duration-200 border ${
 isSelected
 ? 'border-slate-700 bg-white shadow-md ring-2 ring-slate-900/10'
 : 'border-slate-200/80 bg-white hover:border-slate-400 hover:shadow-sm'
 }`}
 >
 <div className="flex items-start gap-3.5">
 {/* Radio Selector Icon */}
 <div className="pt-0.5 flex-shrink-0">
 <div
 className={`h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
 isSelected
 ? 'border-slate-900 bg-slate-900 shadow-sm'
 : 'border-slate-300 bg-slate-50 group-hover:border-slate-400'
 }`}
 >
 {isSelected && (
 <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 )}
 </div>
 </div>

 {/* Main Listing Details */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-3 mb-1">
 <h3 className="text-sm font-bold text-slate-900 tracking-tight truncate group-hover:text-slate-900 transition-colors">
 {listing.title}
 </h3>

 <span className="font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-300/60 flex-shrink-0">
 {formatPaymentAmount(listing.price, listing.currency)}
 </span>
 </div>

 {listing.description && (
 <p className="mb-2 line-clamp-1 text-xs text-slate-500 leading-relaxed">
 {listing.description}
 </p>
 )}

 <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
 {listing.city && (
 <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
 {listing.city}
 </span>
 )}
 <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200/50">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
 {t("draft")}
 </span>
 <span className="ml-auto text-slate-400">
 #{listing.id ? listing.id.substring(0, 6).toUpperCase() : ''}
 </span>
 </div>
 </div>

 {/* Context Actions */}
 <div className="flex-shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
 <ListingCardActions listing={listing} onChanged={onListingChanged} />
 </div>
 </div>
 </motion.div>
 );
 })}
 </AnimatePresence>
 </div>
 </div>
 );
};

export default DraftListingsList;