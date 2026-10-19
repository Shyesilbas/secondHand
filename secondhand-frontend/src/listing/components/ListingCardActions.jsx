import { useState } from 'react';
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
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-9 px-3 w-full cursor-pointer"
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
          <span>{t("open_management_panel", "Hızlı İşlemler")}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-border-focus hover:bg-background-secondary h-9 w-9 cursor-pointer"
          title={t("manage_listing", "İlanı Yönet")}
          aria-label={t("manage_listing", "İlanı Yönet")}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
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