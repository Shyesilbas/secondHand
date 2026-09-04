import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useListingActions } from '../hooks/useListingActions.js';
import { ListingQuickActionsModal } from './ListingQuickActionsModal.jsx';
import { Settings } from 'lucide-react';

const ListingCardActions = ({
  listing,
  onChanged,
  variant = 'icon'
}) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { showSuccess, showError } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isInShowcase } = useShowcaseQueries();

  const actions = useListingActions({
    listing,
    onChanged,
    onCloseMenu: () => setIsModalOpen(false)
  });

  const isOwner = user?.id === listing?.sellerId;
  if (!isOwner) return null;

  const listingInShowcase = isInShowcase(listing.id);

  return (
    <>
      {variant === 'button' ? (
        <button
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.99]"
        >
          <Settings className="w-4 h-4" />
          <span>{t("open_management_panel", "Hızlı İşlemleri Aç (Fiyat, Stok, Vitrin)")}</span>
        </button>
      ) : (
        <button 
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }} 
          className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer active:scale-95" 
          title={t("manage_listing", "İlanı Yönet")}
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      <ListingQuickActionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={listing}
        actions={actions}
        listingInShowcase={listingInShowcase}
        onChanged={onChanged}
        showSuccess={showSuccess}
        showError={showError}
      />
    </>
  );
};

export default ListingCardActions;