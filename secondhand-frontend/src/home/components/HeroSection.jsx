import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const HeroSection = () => {
  return (
    <section 
      className="py-20 lg:py-28"
      style={{ 
        backgroundColor: 'var(--page-hero-background, #ffffff)' 
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary sm:text-5xl lg:text-6xl mb-8 leading-tight">
            Your Trusted Marketplace for
            <span className="text-text-primary block">Second-Hand Items</span>
          </h1>
          
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            Buy and sell quality items with confidence. From vehicles to electronics, 
            find exactly what you need in our secure marketplace.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to={ROUTES.LISTINGS}
              className="inline-flex items-center justify-center px-8 py-4 text-white font-semibold rounded-lg transition-colors min-w-[200px]"
              style={{
                backgroundColor: 'var(--page-hero-button-primary, #059669)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--page-hero-button-primary-hover, #047857)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--page-hero-button-primary, #059669)';
              }}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Listings
            </Link>
            
            <Link
              to={ROUTES.CREATE_LISTING}
              className="inline-flex items-center justify-center px-8 py-4 border-2 font-semibold rounded-lg transition-colors min-w-[200px]"
              style={{
                backgroundColor: 'var(--page-hero-button-secondary, transparent)',
                color: 'var(--page-hero-button-secondary-text, #059669)',
                borderColor: 'var(--page-hero-button-secondary-border, #059669)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--page-hero-button-secondary-hover, #ecfdf5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--page-hero-button-secondary, transparent)';
              }}
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
