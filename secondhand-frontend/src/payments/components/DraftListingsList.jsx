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
 <div className="flex items-center justify-between pb-2 border-b border-border-light">
 <div>
 <h2 className="text-lg font-semibold text-text-primary tracking-tight flex items-center gap-2">
 <span>{t("draft_listings")}</span>
 <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-secondary-200 text-text-primary border border-border">
 {listings.length}
 </span>
 </h2>
 <p className="text-sm text-text-tertiary mt-0.5">
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
 className={`group relative rounded p-4 cursor-pointer transition-colors duration-150 border ${
 isSelected
 ? 'border-accent-teal bg-background-primary ring-1 ring-accent-teal'
 : 'border-border bg-background-primary hover:border-secondary-400'
 }`}
 >
 <div className="flex items-start gap-3.5">
 {/* Radio Selector Icon */}
 <div className="pt-0.5 flex-shrink-0">
 <div
 className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${
 isSelected
 ? 'border-primary bg-primary'
 : 'border-card-border-hover bg-background-secondary group-hover:border-secondary-400'
 }`}
 >
 {isSelected && (
 <svg className="h-3 w-3 text-text-inverse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
 </svg>
 )}
 </div>
 </div>

 {/* Main Listing Details */}
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-3 mb-1">
 <h3 className="text-sm font-semibold text-text-primary tracking-tight truncate group-hover:text-text-primary transition-colors">
 {listing.title}
 </h3>

 <span className="font-semibold text-sm text-text-primary bg-background-tertiary px-2 py-0.5 rounded border border-border flex-shrink-0">
 {formatPaymentAmount(listing.price, listing.currency)}
 </span>
 </div>

 {listing.description && (
 <p className="mb-2 line-clamp-1 text-sm text-text-tertiary leading-relaxed">
 {listing.description}
 </p>
 )}

 <div className="flex items-center gap-2 text-xs text-text-tertiary font-medium">
 {listing.city && (
 <span className="bg-background-tertiary px-2 py-0.5 rounded text-text-secondary">
 {listing.city}
 </span>
 )}
 <span className="inline-flex items-center rounded-sm border border-border bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
 {t("draft")}
 </span>
 <span className="ml-auto text-text-muted">
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