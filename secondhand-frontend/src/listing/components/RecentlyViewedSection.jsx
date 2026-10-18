import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed.js';
import { formatCurrency } from '../../common/formatters.js';

const RecentlyViewedSection = ({ currentListingId = null, className = '' }) => {
 const { t } = useTranslation();
 const { recentlyViewed, removeRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

 // Exclude current listing if we are on a ListingDetailPage
 const itemsToDisplay = recentlyViewed.filter((item) => item.id !== currentListingId);

 if (itemsToDisplay.length === 0) {
 return null;
 }

 return (
 <div className={`w-full rounded-md bg-background-secondary/80 border border-border/80 p-5 sm:p-6 ${className}`}>
 {/* Header */}
 <div className="flex items-center justify-between pb-3.5 border-b border-border/70">
 <div className="flex items-center gap-2.5">
 <div className="p-2 rounded bg-white border border-border/80 text-text-primary">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
 </div>
 <div>
 <h3 className="text-base font-semibold text-text-primary tracking-tight flex items-center gap-2">
 <span>{t("recently_viewed_listings")}</span>
 <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-primary text-white">
 {itemsToDisplay.length}
 </span>
 </h3>
 <p className="text-xs text-text-tertiary font-medium">
 {t("recently_viewed_subtitle")}
 </p>
 </div>
 </div>

 <button
 onClick={clearRecentlyViewed}
 className="text-xs font-semibold text-text-muted hover:text-status-error-text transition-colors px-2.5 py-1 rounded hover:bg-background-secondary"
 >
 {t("clear_history")}
 </button>
 </div>

 {/* Horizontal Scroll Carousel Container */}
 <div className="flex items-center gap-4 overflow-x-auto pt-4 pb-1 snap-x scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
 <AnimatePresence mode="popLayout">
 {itemsToDisplay.map((item, index) => (
 <motion.div
 key={item.id}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.9 }}
 transition={{ duration: 0.25, delay: index * 0.03 }}
 className="snap-start flex-shrink-0 w-48 sm:w-52 group relative rounded bg-white border border-border/80 hover:border-secondary-400 transition-all overflow-hidden flex flex-col"
 >
 {/* Delete badge button */}
 <button
 onClick={(e) => {
 e.preventDefault();
 e.stopPropagation();
 removeRecentlyViewed(item.id);
 }}
 className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-primary/40 hover:bg-status-error text-white opacity-0 group-hover:opacity-100 transition-all shadow-md"
 title={t("remove")}
 >
 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>

 <Link to={`/listings/${item.id}`} className="flex flex-col h-full">
 {/* Image Cover */}
 <div className="w-full h-32 bg-background-tertiary relative overflow-hidden flex-shrink-0">
 {item.coverImage ? (
 <img
 src={item.coverImage}
 alt={item.title}
 className="w-full h-full object-cover transition-transform duration-300"
 />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-background-tertiary text-text-muted">
 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
 </svg>
 </div>
 )}

 {item.city && (
 <span className="absolute bottom-2 left-2 px-2 py-0.5 text-xs font-semibold text-text-primary bg-background-primary rounded-md border border-white/60">
 {item.city}
 </span>
 )}
 </div>

 {/* Details Footer */}
 <div className="p-3 flex flex-col justify-between flex-1 space-y-1.5">
 <h4 className="text-xs font-semibold text-text-primary group-hover:text-text-primary transition-colors line-clamp-2 leading-snug">
 {item.title}
 </h4>

 <div className="pt-1 flex items-baseline justify-between border-t border-border-light">
 <span className="text-xs sm:text-sm font-semibold text-text-primary">
 {formatCurrency(item.price, item.currency)}
 </span>
 </div>
 </div>
 </Link>
 </motion.div>
 ))}
 </AnimatePresence>
 </div>
 </div>
 );
};

export default RecentlyViewedSection;
