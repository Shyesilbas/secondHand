import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService.js';

export const useListingReviews = (listingId) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!listingId) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching reviews for listing:', listingId);
        
                const reviewsResponse = await reviewService.getReviewsForListing(listingId);
        console.log('Reviews response:', reviewsResponse);
        
                setReviews(reviewsResponse.content || []);
        
                try {
          const statsResponse = await reviewService.getListingReviewStats(listingId);
          console.log('Stats response:', statsResponse);
          
                    setStats(statsResponse);
        } catch (statsError) {
          console.warn('Failed to fetch stats, continuing with reviews only:', statsError);
          setStats(null);
        }
        
      } catch (err) {
        console.error('Error fetching listing reviews:', err);
        setError(err.message || 'Failed to load reviews');
        setReviews([]);
        setStats(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [listingId]);

  return {
    reviews,
    stats,
    isLoading,
    error,
    hasReviews: reviews.length > 0
  };
};
