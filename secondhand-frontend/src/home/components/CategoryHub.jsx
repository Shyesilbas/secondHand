import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import {
  Car,
  Building2,
  Laptop,
  Shirt,
  Home,
  Dumbbell,
  BookOpen,
  Sparkles,
  Package2
} from 'lucide-react';

const CATEGORIES = [
  { value: 'VEHICLE', label: 'Vehicles', icon: Car, bg: 'bg-blue-50/60 hover:bg-blue-50 text-blue-600 border-blue-100/60' },
  { value: 'REAL_ESTATE', label: 'Real Estate', icon: Building2, bg: 'bg-amber-50/60 hover:bg-amber-50 text-amber-600 border-amber-100/60' },
  { value: 'ELECTRONICS', label: 'Electronics', icon: Laptop, bg: 'bg-indigo-50/60 hover:bg-indigo-50 text-indigo-600 border-indigo-100/60' },
  { value: 'CLOTHING', label: 'Fashion', icon: Shirt, bg: 'bg-rose-50/60 hover:bg-rose-50 text-rose-600 border-rose-100/60' },
  { value: 'HOME_LIVING', label: 'Home & Living', icon: Home, bg: 'bg-emerald-50/60 hover:bg-emerald-50 text-emerald-600 border-emerald-100/60', routeValue: 'OTHER' },
  { value: 'SPORTS', label: 'Sports', icon: Dumbbell, bg: 'bg-purple-50/60 hover:bg-purple-50 text-purple-600 border-purple-100/60' },
  { value: 'BOOKS', label: 'Books', icon: BookOpen, bg: 'bg-orange-50/60 hover:bg-orange-50 text-orange-600 border-orange-100/60' },
  { value: 'COLLECTIBLES', label: 'Collectibles', icon: Package2, bg: 'bg-teal-50/60 hover:bg-teal-50 text-teal-600 border-teal-100/60', routeValue: 'OTHER' }
];

const CategoryHub = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (cat) => {
    const val = cat.routeValue || cat.value;
    // Route to listings prefilter with category param
    navigate(`${ROUTES.LISTINGS_PREFILTER}?type=${encodeURIComponent(val)}`);
  };

  return (
    <section className="py-10 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-1">
            Browse Categories
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            What are you looking for?
          </h2>
        </div>

        {/* Categories container: swipeable on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-8 md:overflow-x-visible md:pb-0">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat)}
                className="flex flex-col items-center justify-center shrink-0 w-28 h-28 md:w-auto md:h-28 rounded-2xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 group-hover:scale-105 ${cat.bg}`}>
                  <Icon className="w-5 h-5 shrink-0" />
                </div>
                <span className="text-[12px] font-bold text-slate-700 mt-3 group-hover:text-slate-900 transition-colors truncate w-full text-center">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryHub;
