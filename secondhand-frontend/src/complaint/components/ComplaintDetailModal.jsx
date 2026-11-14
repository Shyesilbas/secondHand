import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Modal } from '../../common/components/ui/index.js';
import { ROUTES } from '../../common/constants/routes.js';
import { formatDate, formatDateTime } from '../../common/formatters.js';
import {
  APPEAL_STATUS_LABELS,
  COMPLAINT_STATUS_LABELS,
  PENALTY_LABELS,
  VIOLATION_LABELS,
  labelOf,
} from '../complaintConstants.js';
import { ComplaintReason } from '../types/complaintTypes.js';

const REASON_LABELS = {
  [ComplaintReason.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
  [ComplaintReason.HARASSMENT]: 'Harassment',
  [ComplaintReason.SCAM_FRAUD]: 'Scam/Fraud Listing',
  [ComplaintReason.FALSE_ADVERTISING]: 'False Advertising',
  [ComplaintReason.COPYRIGHT_VIOLATION]: 'Copyright Violation',
  [ComplaintReason.SPAM]: 'Spam',
  [ComplaintReason.OTHER]: 'Other',
};

const SectionTitle = ({ children }) => (
  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">{children}</h4>
);

/**
 * Full view of one complaint: the reported chat message or listing it is about, the description,
 * evidence images and the Aura decision. The reported message text comes from the backend and is
 * null once the message has been deleted.
 */
const ComplaintDetailModal = ({ complaint, side = 'filed', isOpen, onClose }) => {
  const { t } = useTranslation();
  if (!complaint) return null;

  const hasMessage = Boolean(complaint.reportedMessageId);
  const hasListing = Boolean(complaint.listingId);
  const targetTitle = hasMessage
    ? t('complaint_target_message', 'Message')
    : hasListing
      ? t('complaint_target_listing', 'Listing')
      : t('complaint_target_user', 'User');
  const decided = complaint.status === 'RESOLVED' || complaint.status === 'DISMISSED';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={targetTitle} size="md">
      <div className="space-y-6 text-sm">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span className="inline-flex items-center rounded-sm bg-background-secondary px-2 py-0.5 font-medium">
            {REASON_LABELS[complaint.reason] || complaint.reason}
          </span>
          <span>{labelOf(COMPLAINT_STATUS_LABELS, complaint.status, t)}</span>
          <span className="tabular-nums text-text-tertiary">{formatDate(complaint.createdAt) || '-'}</span>
        </div>

        {hasMessage && (
          <section>
            <SectionTitle>{t('complaint_reported_message', 'Reported message')}</SectionTitle>
            {complaint.reportedMessageContent ? (
              <blockquote className="whitespace-pre-wrap break-words rounded border border-border-light bg-background-secondary px-4 py-3 leading-relaxed text-text-primary">
                {complaint.reportedMessageContent}
              </blockquote>
            ) : (
              <p className="text-text-tertiary">
                {t('complaint_message_unavailable', 'This message was deleted and is no longer available.')}
              </p>
            )}
          </section>
        )}

        {hasListing && (
          <section>
            <SectionTitle>{t('complaint_reported_listing', 'Reported listing')}</SectionTitle>
            {complaint.listingTitle ? (
              <Link
                to={ROUTES.LISTING_DETAIL(complaint.listingId)}
                onClick={onClose}
                className="font-medium text-text-primary underline-offset-2 hover:underline"
              >
                {complaint.listingTitle}
              </Link>
            ) : (
              <p className="text-text-tertiary">{t('complaint_listing_unavailable', 'This listing is no longer available.')}</p>
            )}
          </section>
        )}

        {side === 'filed' && complaint.description && (
          <section>
            <SectionTitle>{t('description', 'Description')}</SectionTitle>
            <p className="whitespace-pre-wrap break-words leading-relaxed text-text-primary">{complaint.description}</p>
          </section>
        )}

        {complaint.evidenceImageUrls.length > 0 && (
          <section>
            <SectionTitle>{t('complaint_evidence_images_short', 'Evidence images')}</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {complaint.evidenceImageUrls.map((url) => (
                <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded border border-border-light">
                  <img src={url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                </a>
              ))}
            </div>
          </section>
        )}

        {side === 'received' && complaint.appealStatus !== 'NONE' && (
          <section>
            <SectionTitle>{t('appeal', 'Appeal')}</SectionTitle>
            <p className="font-medium text-text-primary">{labelOf(APPEAL_STATUS_LABELS, complaint.appealStatus, t)}</p>
            {complaint.appealDecisionNotes && (
              <p className="mt-2 leading-relaxed text-text-secondary">{complaint.appealDecisionNotes}</p>
            )}
          </section>
        )}

        {decided && (
          <section>
            <SectionTitle>{t('aura_review', 'Aura review')}</SectionTitle>
            <div className="grid grid-cols-1 gap-2">
              {complaint.violationCategory && (
                <p><span className="text-text-tertiary">{t('violation', 'Violation')}: </span>{labelOf(VIOLATION_LABELS, complaint.violationCategory, t)}</p>
              )}
              {complaint.penaltyAction && complaint.penaltyAction !== 'NONE' && (
                <p><span className="text-text-tertiary">{t('penalty', 'Penalty')}: </span>{labelOf(PENALTY_LABELS, complaint.penaltyAction, t)}</p>
              )}
              {complaint.resolvedAt && (
                <p><span className="text-text-tertiary">{t('resolved')}: </span><span className="tabular-nums">{formatDate(complaint.resolvedAt)}</span></p>
              )}
              {complaint.adminNotes && (
                <p className="rounded border border-border-light bg-background-secondary px-3 py-2 leading-relaxed text-text-secondary">{complaint.adminNotes}</p>
              )}
            </div>
          </section>
        )}

        {complaint.eligibleForReviewAt && complaint.status === 'PENDING' && (
          <p className="text-xs tabular-nums text-text-tertiary">
            {t('review_starts', 'Review starts')}: {formatDateTime(complaint.eligibleForReviewAt)}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ComplaintDetailModal;
