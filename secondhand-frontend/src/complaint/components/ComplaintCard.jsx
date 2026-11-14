import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { ComplaintReason } from '../types/complaintTypes.js';
import { formatDate, formatDateTime } from '../../common/formatters.js';
import { Button } from '../../common/components/ui/index.js';
import {
  APPEAL_STATUS_LABELS,
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_STATUS_TONES,
  PENALTY_LABELS,
  VIOLATION_LABELS,
  labelOf,
} from '../complaintConstants.js';

const REASON_LABELS = {
  [ComplaintReason.INAPPROPRIATE_CONTENT]: 'Inappropriate Content',
  [ComplaintReason.HARASSMENT]: 'Harassment',
  [ComplaintReason.SCAM_FRAUD]: 'Scam/Fraud Listing',
  [ComplaintReason.FALSE_ADVERTISING]: 'False Advertising',
  [ComplaintReason.COPYRIGHT_VIOLATION]: 'Copyright Violation',
  [ComplaintReason.SPAM]: 'Spam',
  [ComplaintReason.OTHER]: 'Other',
};

const TONE_DOT = {
  warning: 'bg-status-warning',
  success: 'bg-status-success',
  neutral: 'bg-text-muted',
};

const Row = ({ label, children }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-text-tertiary">{label}</span>
    <span className="min-w-0 truncate text-right font-medium text-text-primary">{children}</span>
  </div>
);

/**
 * One complaint. {@code side} is "filed" (the user is the complainer) or "received" (the user is the
 * reported party, who may appeal a penalty). The card body opens the detail modal through {@code onOpen};
 * the appeal action sits outside that button.
 */
const ComplaintCard = ({ complaint, side = 'filed', onOpen, onAppeal }) => {
  const { t } = useTranslation();
  if (!complaint) return null;
  const decided = complaint.status === 'RESOLVED' || complaint.status === 'DISMISSED';
  const tone = COMPLAINT_STATUS_TONES[complaint.status] || 'neutral';
  const canAppeal = side === 'received' && complaint.appealStatus === 'NONE' && Boolean(complaint.appealDeadline)
    && new Date(complaint.appealDeadline) > new Date();
  const ownPenalty = side === 'filed' && complaint.badFaithReport;
  const targetLabel = complaint.reportedMessageId
    ? t('complaint_target_message', 'Message')
    : complaint.listingId
      ? t('complaint_target_listing', 'Listing')
      : t('complaint_target_user', 'User');

  return (
    <div className="flex h-full flex-col rounded border border-border bg-background-primary transition-colors duration-150 hover:border-border-focus">
      <button
        type="button"
        onClick={() => onOpen?.(complaint)}
        className="flex flex-1 flex-col rounded px-6 pb-4 pt-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium tracking-tight text-text-primary">
              {side === 'received' ? t('complaint_about_you', 'Complaint about you') : t('complaint')}
            </h3>
            <p className="text-xs tabular-nums text-text-tertiary">{formatDate(complaint.createdAt) || '-'}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
            <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} aria-hidden />
            {labelOf(COMPLAINT_STATUS_LABELS, complaint.status, t)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-sm bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
            {targetLabel}
          </span>
          <span className="inline-flex items-center rounded-sm bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
            {REASON_LABELS[complaint.reason] || complaint.reason}
          </span>
        </div>

        {complaint.description && side === 'filed' && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-primary">{complaint.description}</p>
        )}

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
          {side === 'filed' && <Row label={t('complained_user')}>{complaint.complainedUserName}</Row>}
          {complaint.listingTitle && <Row label={t('listing')}>{complaint.listingTitle}</Row>}
          {complaint.status === 'PENDING' && complaint.eligibleForReviewAt && (
            <Row label={t('review_starts', 'Review starts')}>
              <span className="tabular-nums">{formatDateTime(complaint.eligibleForReviewAt)}</span>
            </Row>
          )}
          {complaint.evidenceImageUrls.length > 0 && (
            <Row label={t('complaint_evidence_images_short', 'Evidence images')}>
              <span className="tabular-nums">{complaint.evidenceImageUrls.length}</span>
            </Row>
          )}
        </div>

        {decided && (
          <div className="mt-4 border-t border-border-light pt-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-text-primary">
              <ShieldCheck className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              {t('aura_review', 'Aura review')}
            </div>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {complaint.violationCategory && (
                <Row label={t('violation', 'Violation')}>{labelOf(VIOLATION_LABELS, complaint.violationCategory, t)}</Row>
              )}
              {complaint.penaltyAction && complaint.penaltyAction !== 'NONE' && (
                <Row label={t('penalty', 'Penalty')}>{labelOf(PENALTY_LABELS, complaint.penaltyAction, t)}</Row>
              )}
              {complaint.resolvedAt && (
                <Row label={t('resolved')}><span className="tabular-nums">{formatDate(complaint.resolvedAt)}</span></Row>
              )}
            </div>
            {complaint.adminNotes && (
              <p className="mt-3 rounded border border-border-light bg-background-secondary px-3 py-2 text-sm leading-relaxed text-text-secondary">
                {complaint.adminNotes}
              </p>
            )}
            {ownPenalty && (
              <p className="mt-3 text-sm text-status-error-text">
                {t('bad_faith_notice', 'This complaint was found to be made in bad faith. Penalty: {{penalty}}.', {
                  penalty: labelOf(PENALTY_LABELS, complaint.complainerPenaltyAction, t),
                })}
              </p>
            )}
          </div>
        )}

        {side === 'received' && complaint.appealStatus !== 'NONE' && (
          <div className="mt-4 border-t border-border-light pt-4 text-sm">
            <p className="font-medium text-text-primary">{labelOf(APPEAL_STATUS_LABELS, complaint.appealStatus, t)}</p>
            {complaint.appealDecisionNotes && (
              <p className="mt-2 leading-relaxed text-text-secondary">{complaint.appealDecisionNotes}</p>
            )}
          </div>
        )}
      </button>

      {canAppeal && (
        <div className="flex items-center justify-between gap-3 px-6 pb-5">
          <span className="text-xs tabular-nums text-text-tertiary">
            {t('appeal_deadline', 'Appeal until')} {formatDateTime(complaint.appealDeadline)}
          </span>
          <Button variant="secondary" size="sm" onClick={() => onAppeal?.(complaint)}>
            {t('appeal', 'Appeal')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;
