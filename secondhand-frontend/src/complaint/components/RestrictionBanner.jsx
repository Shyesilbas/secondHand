import { useTranslation } from 'react-i18next';
import { Alert } from '../../common/components/ui/index.js';
import { formatDateTime } from '../../common/formatters.js';
import { useMyRestriction } from '../hooks/useComplaints.js';

/** Shown to a user under a moderation restriction; renders nothing otherwise or while loading. */
const RestrictionBanner = () => {
  const { t } = useTranslation();
  const { data } = useMyRestriction();
  if (!data?.restricted) return null;

  const blocked = [
    !data.canSendMessages && t('restriction_messages', 'sending messages'),
    !data.canCreateListings && t('restriction_listings', 'publishing listings'),
    !data.canMakeOffers && t('restriction_offers', 'making offers'),
    !data.canCheckout && t('restriction_checkout', 'buying'),
  ].filter(Boolean).join(', ');

  const message = data.permanent
    ? t('restriction_permanent', 'Your account is permanently banned for violating the community rules.')
    : t('restriction_temporary', 'Your account is restricted until {{until}}. Blocked: {{blocked}}.', {
      until: formatDateTime(data.bannedUntil),
      blocked,
    });
  return <Alert type="warning" message={message} />;
};

export default RestrictionBanner;
