import { useTranslation } from "react-i18next";
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { Car, Building2, Laptop, Shirt, Home, Dumbbell, BookOpen } from 'lucide-react';
const CATEGORIES = [{
  value: 'VEHICLE',
  label: 'Vehicles',
  icon: Car,
  bg: 'bg-primary-light hover:bg-primary-200 text-primary border-primary-300'
}, {
  value: 'REAL_ESTATE',
  label: 'Real Estate',
  icon: Building2,
  bg: 'bg-status-warning-bg hover:bg-status-warning-border/20 text-status-warning border-status-warning-border'
}, {
  value: 'ELECTRONICS',
  label: 'Electronics',
  icon: Laptop,
  bg: 'bg-primary-light hover:bg-primary-200 text-primary border-primary-300'
}, {
  value: 'CLOTHING',
  label: 'Fashion',
  icon: Shirt,
  bg: 'bg-secondary-light hover:bg-secondary-200 text-text-secondary border-border-light'
}, {
  value: 'HOME_LIVING',
  label: 'Home & Living',
  icon: Home,
  bg: 'bg-status-success-bg hover:bg-status-success-border/20 text-status-success border-status-success-border',
  routeValue: 'OTHER'
}, {
  value: 'SPORTS',
  label: 'Sports',
  icon: Dumbbell,
  bg: 'bg-secondary-light hover:bg-secondary-200 text-text-secondary border-border-light'
}, {
  value: 'BOOKS',
  label: 'Books',
  icon: BookOpen,
  bg: 'bg-secondary-light hover:bg-secondary-200 text-text-secondary border-border-light'
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
  return <section className="py-8 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
          <p className="text-caption font-bold uppercase tracking-[0.2em] text-status-success mb-1">{t("browse_categories")}</p>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("what_are_you_looking_for")}</h2>
          </div>
          <p className="text-xs font-medium text-text-secondary max-w-sm">{t("jump_into_the_most_active_marketplace_la")}</p>
        </div>

        {/* Categories container: swipeable on mobile, grid on desktop */}
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-x-visible md:pb-0">
          {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return <button key={cat.value} onClick={() => handleCategoryClick(cat)} className="flex flex-col items-center justify-center shrink-0 w-28 h-24 md:w-auto md:h-24 rounded-xl border border-border-light bg-background-primary p-3 transition-all duration-200 hover:border-border hover:shadow-sm group">
                <div className={`w-11 h-11 rounded-md flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${cat.bg}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-body font-bold text-text-secondary mt-2.5 group-hover:text-text-primary transition-colors truncate w-full text-center">
                  {cat.label}
                </span>
              </button>;
          })}
        </div>
      </div>
    </section>;
};
export default CategoryHub;