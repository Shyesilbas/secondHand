import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const HeroSection = () => {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl mb-8 leading-tight">
            Your Trusted Marketplace for
            <span className="text-gray-900 block">Second-Hand Items</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Buy and sell quality items with confidence. From vehicles to electronics, 
            find exactly what you need in our secure marketplace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors min-w-[200px]"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Listings
            </Link>
            
            <Link
              to={ROUTES.CREATE_LISTING}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-900 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors min-w-[200px]"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Sell Your Item
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
