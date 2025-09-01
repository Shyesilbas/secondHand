import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import ContactSellerButton from '../../chat/components/ContactSellerButton';

const ListingCardContactActions = ({ listing, className = '' }) => {
  const { user } = useAuth();

  // Kullanıcı giriş yapmamışsa veya kendi ilanı ise hiçbir şey gösterme
  if (!user || user.id === listing?.sellerId) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ContactSellerButton 
        listing={listing} 
        className="text-xs px-3 py-1.5"
      />
    </div>
  );
};

export default ListingCardContactActions;
