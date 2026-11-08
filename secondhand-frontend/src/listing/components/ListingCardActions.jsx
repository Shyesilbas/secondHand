import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import { useMyShowcases } from '../../showcase/hooks/useMyShowcases.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useListingActions } from '../hooks/useListingActions.js';
import { ListingQuickActionsModal } from './ListingQuickActionsModal.jsx';
import { Settings } from 'lucide-react';
import { buttonClasses } from '../../common/components/ui/Button.jsx';

const ListingCardActions = ({
  listing,
  onChanged,
  variant = 'icon'
}) => {
  const { t } = useTranslation();
  const { user } = useAuthState();
  const { showSuccess, showError } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isOwner = Boolean(user?.id && user.id === listing?.sellerId);
  const { isInShowcase } = useShowcaseQueries({ enabled: isOwner && isModalOpen });
  const { showcases: myShowcases = [] } = useMyShowcases(user?.id, { enabled: isOwner && isModalOpen });

  const actions = useListingActions({
    listing,
    onChanged,
    onCloseMenu: () => setIsModalOpen(false)
  });

  if (!isOwner) return null;

  const isInMyShowcases = Array.isArray(myShowcases) && myShowcases.some(
    s => s?.status === 'ACTIVE' && (s?.listing?.id || s?.listingId) === listing.id
  );
  const listingInShowcase = isModalOpen ? (isInShowcase(listing.id) || isInMyShowcases) : false;

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
          className={`${buttonClasses()} w-full`}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
          <span>{t("manage_listing", "İlanı yönet")}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-background-primary text-text-secondary transition-colors duration-150 ease-out hover:border-card-border-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus cursor-pointer"
          title={t("manage_listing", "İlanı Yönet")}
          aria-label={t("manage_listing", "İlanı Yönet")}
        >
          <Settings className="w-4 h-4" strokeWidth={1.5} />
        </button>
      )}

      {isModalOpen && (
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
      )}
    </>
  );
};

export default ListingCardActions;