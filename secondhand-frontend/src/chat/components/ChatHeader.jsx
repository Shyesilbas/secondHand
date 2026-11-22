import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Ban, EllipsisVertical, ExternalLink, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../common/components/ui/index.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { useRestrictionFlags } from '../../complaint/hooks/useComplaints.js';
import { useBlockUser } from '../../user/hooks/useBlocking.js';
import { CHAT_MESSAGES } from '../chatConstants.js';

const getInitials = (name) => {
  const cleaned = String(name || '').trim();
  if (!cleaned) return '?';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

const ChatHeader = ({
  selectedChatRoom,
  isConnected,
  onClose,
  onBack,
  onDeleteConversation,
  onConversationDeleted,
  onOpenOfferModal,
  isEmbedded = false
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notification = useNotification();
  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef(null);
  const { canMakeOffers } = useRestrictionFlags();
  const blockMutation = useBlockUser();

  useEffect(() => {
    if (!showOptions) return undefined;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowOptions(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showOptions]);

  const handleBlockUser = () => {
    if (!selectedChatRoom?.otherParticipantId) return;
    notification.showConfirmation(
      t('block_user', 'Kullanıcıyı engelle'),
      'Bu kullanıcıyı engellemek istiyor musunuz? İki taraf da birbirinin ilanlarını göremez, mesaj ve teklif gönderemez.',
      () => {
        blockMutation.mutate(selectedChatRoom.otherParticipantId, {
          onSuccess: () => {
            onClose?.();
          }
        });
      }
    );
    setShowOptions(false);
  };

  const handleListingTitleClick = () => {
    if (selectedChatRoom?.listingId) {
      navigate(ROUTES.LISTING_DETAIL(selectedChatRoom.listingId));
      if (!isEmbedded) onClose?.();
    }
  };

  const handleUserClick = () => {
    if (selectedChatRoom?.otherParticipantId) {
      navigate(ROUTES.USER_PROFILE(selectedChatRoom.otherParticipantId));
      if (!isEmbedded) onClose?.();
    }
  };

  const handleDeleteConversation = () => {
    if (!onDeleteConversation) {
      setShowOptions(false);
      return;
    }
    notification.showConfirmation(
      CHAT_MESSAGES.DELETE_CONVERSATION_TITLE,
      CHAT_MESSAGES.DELETE_CONVERSATION_CONFIRMATION,
      () => {
        onDeleteConversation(selectedChatRoom.id);
        onConversationDeleted?.(selectedChatRoom.id);
        if (!isEmbedded) onClose?.();
        notification.showSuccess(CHAT_MESSAGES.SUCCESS_TITLE, CHAT_MESSAGES.CONVERSATION_DELETED);
      }
    );
    setShowOptions(false);
  };

  const headerName = selectedChatRoom?.otherParticipantName || selectedChatRoom?.title || t('chat', 'Sohbet');
  const listingLabel = selectedChatRoom?.listingTitle || '';
  const profileId = selectedChatRoom?.otherParticipantId;

  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-light bg-background-primary px-4 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {isEmbedded && onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label={t('back', 'Geri')}
            className="shrink-0 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
        )}

        <div
          aria-hidden
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-sm font-semibold text-text-secondary"
        >
          {getInitials(headerName)}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {profileId ? (
              <button
                type="button"
                onClick={handleUserClick}
                className="truncate rounded-sm text-left text-sm font-semibold text-text-primary transition-colors duration-150 hover:text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                title={t('view_user_profile', 'Profili görüntüle')}
              >
                {headerName}
              </button>
            ) : (
              <span className="truncate text-sm font-semibold text-text-primary">{headerName}</span>
            )}
            {!isEmbedded && (
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${isConnected ? 'bg-status-success' : 'bg-secondary-300'}`}
                title={isConnected ? t('chat_online', 'Çevrimiçi') : t('chat_offline', 'Çevrimdışı')}
              />
            )}
          </div>

          {Boolean(listingLabel) && selectedChatRoom?.listingId && (
            <button
              type="button"
              onClick={handleListingTitleClick}
              className="mt-0.5 flex max-w-full items-center gap-1 rounded-sm text-left text-xs text-text-link transition-colors duration-150 hover:text-text-linkHover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              title={listingLabel}
            >
              <span className="truncate">{listingLabel}</span>
              <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.5} aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {selectedChatRoom?.listingId && onOpenOfferModal && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenOfferModal}
            disabled={!canMakeOffers || selectedChatRoom?.messagingDisabled}
            title={t('make_offer', 'Teklif ver')}
            className="mr-1"
          >
            {t('offer', 'Teklif')}
          </Button>
        )}

        {(onDeleteConversation || profileId) && (
          <div ref={menuRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowOptions((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={showOptions}
              aria-label={t('options', 'Seçenekler')}
              title={t('options', 'Seçenekler')}
            >
              <EllipsisVertical className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </Button>

            {showOptions && (
              <div
                role="menu"
                className="absolute right-0 top-full z-dropdown mt-1 min-w-44 rounded border border-border bg-background-primary p-1 shadow-md"
              >
                {profileId && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleBlockUser}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-text-primary transition-colors duration-150 hover:bg-background-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <Ban className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
                    <span>{t('block_user', 'Kullanıcıyı engelle')}</span>
                  </button>
                )}
                {onDeleteConversation && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDeleteConversation}
                    className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-status-error-text transition-colors duration-150 hover:bg-status-error-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                    <span>{t('delete_chat', 'Sohbeti sil')}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!isEmbedded && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label={t('close', 'Kapat')}
          >
            <X className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Button>
        )}
      </div>
    </header>
  );
};

export default ChatHeader;
