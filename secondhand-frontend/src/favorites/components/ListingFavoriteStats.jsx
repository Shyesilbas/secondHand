
const ListingFavoriteStats = ({
                                listing,
                                showIcon = true,
                                showText = true,
                                size = 'sm',
                                className = ''
                              }) => {
  const sizeConfig = {
    xs: { icon: 'w-3 h-3', text: 'text-xs' },
    sm: { icon: 'w-4 h-4', text: 'text-sm' },
    md: { icon: 'w-5 h-5', text: 'text-base' },
  };

  const config = sizeConfig[size] || sizeConfig.sm;

  if (!listing?.favoriteStats) {
    return (
        <div className={`flex items-center gap-1 ${className}`}>
          {showIcon && (
              <svg className={`${config.icon} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
          )}
          {showText && <span className={`${config.text} text-gray-400`}>-</span>}
        </div>
    );
  }

  const { favoriteCount } = listing.favoriteStats;

  return (
      <div className={`flex items-center gap-1 ${className}`}>
        {showIcon && (
            <svg className={`${config.icon} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        )}
        {showText && (
            <span className={`${config.text} text-gray-700`}>
          {favoriteCount} {favoriteCount === 1 ? 'Favorite' : 'Favorites'}
        </span>
        )}
      </div>
  );
};

export default ListingFavoriteStats;
