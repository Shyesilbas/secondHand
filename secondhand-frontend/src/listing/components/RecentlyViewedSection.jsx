import React from 'react';
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
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
    <div className={`w-full space-y-4 my-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{t("recently_viewed_listings")}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                {itemsToDisplay.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              {t("recently_viewed_subtitle")}
            </p>
          </div>
        </div>

        <button
          onClick={clearRecentlyViewed}
          className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
        >
          {t("clear_history")}
        </button>
      </div>

      {/* Horizontal Scroll Carousel Container */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout">
          {itemsToDisplay.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className="snap-start flex-shrink-0 w-52 sm:w-56 group relative rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all overflow-hidden flex flex-col"
            >
              {/* Delete badge button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeRecentlyViewed(item.id);
                }}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-slate-900/40 hover:bg-rose-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-md"
                title={t("remove")}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <Link to={`/listings/${item.id}`} className="flex flex-col h-full">
                {/* Image Cover */}
                <div className="w-full h-36 bg-slate-100 relative overflow-hidden flex-shrink-0">
                  {item.coverImage ? (
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {item.city && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-semibold text-slate-800 bg-white/90 backdrop-blur-md rounded-md border border-white/60">
                      {item.city}
                    </span>
                  )}
                </div>

                {/* Details Footer */}
                <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <div className="pt-1 flex items-baseline justify-between border-t border-slate-100">
                    <span className="font-mono text-sm font-extrabold text-emerald-700">
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
