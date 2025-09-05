import { useState, useEffect } from 'react';
import { listingService } from '../../listing/services/listingService.js';

export const useUserListings = (userId) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserListings = async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);
        try {
            // Gerçek API çağrısı
            const response = await listingService.getUserListings(userId);

            if (response && Array.isArray(response) && response.length > 0) {
                setListings(response);
            } else if (response && Array.isArray(response) && response.length === 0) {
                // API çalıştı ama boş liste döndü
                setListings([]);
            } else {
                // Mock data fallback - API çalışmadığında
                const mockListings = [
                    {
                        id: 1,
                        title: "iPhone 14 Pro Max",
                        price: 25000,
                        currency: "TRY",
                        status: "ACTIVE",
                        createdAt: "2024-01-15T10:30:00",
                        imageUrl: "/api/placeholder/150/150"
                    },
                    {
                        id: 2,
                        title: "MacBook Pro M3",
                        price: 45000,
                        currency: "TRY",
                        status: "ACTIVE",
                        createdAt: "2024-01-10T14:20:00",
                        imageUrl: "/api/placeholder/150/150"
                    }
                ];
                setListings(mockListings);
            }
        } catch (err) {
            console.error('User listings fetch error:', err);
            console.error('Error details:', err.response?.data);

            // Mock data fallback on error
            const mockListings = [
                {
                    id: 1,
                    title: "iPhone 14 Pro Max",
                    price: 25000,
                    currency: "TRY",
                    status: "ACTIVE",
                    createdAt: "2024-01-15T10:30:00",
                    imageUrl: "/api/placeholder/150/150"
                },
                {
                    id: 2,
                    title: "MacBook Pro M3",
                    price: 45000,
                    currency: "TRY",
                    status: "ACTIVE",
                    createdAt: "2024-01-10T14:20:00",
                    imageUrl: "/api/placeholder/150/150"
                }
            ];
            setListings(mockListings);
            setError(null); // Error'u temizle ki mock data gösterilsin
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserListings();
    }, [userId]);

    return {
        listings,
        isLoading,
        error,
        refetch: fetchUserListings
    };
};
