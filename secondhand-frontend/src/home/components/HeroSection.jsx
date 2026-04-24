import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          {/* Left — copy */}
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Community marketplace
            </p>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-gray-900 leading-[1.15]">
              Buy and sell with people you can&nbsp;trust.
            </h1>
            <p className="mt-3 text-[15px] text-gray-500 leading-relaxed max-w-lg">
              Explore listings from verified sellers, compare prices, and trade safely — all in one place.
            </p>

            <div className="mt-6 flex items-center gap-2.5">
              <Link
                to={ROUTES.LISTINGS_PREFILTER}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                Explore
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to={ROUTES.LISTINGS_PREFILTER_CREATE}
                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start Selling
              </Link>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
};

export default HeroSection;
