import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            Trusted community marketplace
          </p>
          <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900">
            Find what you need, sell what you no longer use.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl">
            Explore top categories, discover featured products, and start trading safely with verified users.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to={ROUTES.LISTINGS_PREFILTER}
              className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              Explore Listings
            </Link>
            <Link
              to={ROUTES.CREATE_LISTING}
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
