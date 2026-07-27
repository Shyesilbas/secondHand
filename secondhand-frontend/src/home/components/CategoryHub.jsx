import { useTranslation } from "react-i18next";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { Car, Building2, Laptop, Shirt, Home, Dumbbell, BookOpen } from 'lucide-react';
const CATEGORIES = [{
  value: 'VEHICLE',
  label: 'Vehicles',
  icon: Car,
  bg: 'bg-primary-light hover:bg-primary-100 text-primary border-primary-200'
}, {
  value: 'REAL_ESTATE',
  label: 'Real Estate',
  icon: Building2,
  bg: 'bg-status-warning-bg hover:bg-status-warning-bg text-status-warning border-status-warning-border'
}, {
  value: 'ELECTRONICS',
  label: 'Electronics',
  icon: Laptop,
  bg: 'bg-primary-light hover:bg-primary-100 text-primary border-primary-200'
}, {
  value: 'CLOTHING',
  label: 'Fashion',
  icon: Shirt,
  bg: 'bg-secondary-light hover:bg-secondary-100 text-text-secondary border-border-light'
}, {
  value: 'HOME_LIVING',
  label: 'Home & Living',
  icon: Home,
  bg: 'bg-status-success-bg hover:bg-status-success-bg text-status-success border-status-success-border',
  routeValue: 'OTHER'
}, {
  value: 'SPORTS',
  label: 'Sports',
  icon: Dumbbell,
  bg: 'bg-secondary-light hover:bg-secondary-100 text-text-secondary border-border-light'
}, {
  value: 'BOOKS',
  label: 'Books',
  icon: BookOpen,
  bg: 'bg-secondary-light hover:bg-secondary-100 text-text-secondary border-border-light'
}];
const CategoryHub = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const handleCategoryClick = cat => {
    const val = cat.routeValue || cat.value;
    // Route to listings prefilter with category param
    navigate(`${ROUTES.LISTINGS_PREFILTER}?type=${encodeURIComponent(val)}`);
  };
  return <section className="py-12 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 mb-1">{t("browse_categories")}</p>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t("what_are_you_looking_for")}</h2>
          </div>
          <p className="text-xs font-medium text-slate-500 max-w-sm">{t("jump_into_the_most_active_marketplace_la")}</p>
        </div>

        {/* Categories container: swipeable on mobile, grid on desktop */}
        <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-x-visible md:pb-0">
          {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return <button key={cat.value} onClick={() => handleCategoryClick(cat)} className="flex flex-col items-center justify-center shrink-0 w-28 h-28 md:w-auto md:h-28 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/10 hover:-translate-y-1 group">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-emerald-100 bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
                  <Icon className="w-6 h-6 shrink-0" />
                </div>
                <span className="text-xs font-bold text-slate-700 mt-3 group-hover:text-slate-900 transition-colors truncate w-full text-center">
                  {cat.label}
                </span>
              </button>;
          })}
        </div>
      </div>
    </section>;
};
export default CategoryHub;