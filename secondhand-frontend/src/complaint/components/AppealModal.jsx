import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from '../../common/components/ui/index.js';
import { formatDateTime } from '../../common/formatters.js';
import { COMPLAINT_DEFAULTS, COMPLAINT_MESSAGES, PENALTY_LABELS, labelOf } from '../complaintConstants.js';
import { useSubmitAppeal } from '../hooks/useComplaints.js';

const FIELD = 'w-full resize-none rounded border bg-background-primary px-3 py-2 text-sm text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus';

/** One appeal per decision, within the appeal window (backend validates both again). */
const AppealModal = ({ complaint, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);
  const appeal = useSubmitAppeal();

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < COMPLAINT_DEFAULTS.MIN_APPEAL_LENGTH) {
      setError(COMPLAINT_MESSAGES.APPEAL_TOO_SHORT);
      return;
    }
    try {
      await appeal.mutateAsync({ complaintId: complaint.complaintId, reason });
      onClose();
    } catch {
      // useSubmitAppeal shows the error; keep the form open for a retry.
    }
  };

  if (!complaint) return null;
  return (
    <Modal
      isOpen={isOpen}
      onClose={appeal.isPending ? () => {} : onClose}
      title={t('appeal_decision', 'Appeal decision')}
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={appeal.isPending}>{t('cancel')}</Button>
          <Button type="submit" form="appeal-form" disabled={appeal.isPending || !reason.trim()}>
            {appeal.isPending ? t('submitting') : t('submit_appeal', 'Submit appeal')}
          </Button>
        </>
      )}
    >
      <p className="mb-4 text-sm text-text-secondary">
        {t('appeal_intro', 'Decision')}: <span className="font-medium text-text-primary">{labelOf(PENALTY_LABELS, complaint.penaltyAction, t)}</span>
        {complaint.appealDeadline && (
          <>
            {' '}&middot; {t('appeal_deadline', 'Appeal until')}{' '}
            <span className="tabular-nums">{formatDateTime(complaint.appealDeadline)}</span>
          </>
        )}
      </p>
      <form id="appeal-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="appeal-reason" className="mb-1 block text-sm font-medium text-text-primary">
          {t('appeal_reason', 'Why should the decision be changed?')}
        </label>
        <textarea
          id="appeal-reason"
          rows={5}
          value={reason}
          maxLength={COMPLAINT_DEFAULTS.MAX_APPEAL_LENGTH}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError(null);
          }}
          disabled={appeal.isPending}
          aria-invalid={Boolean(error)}
          className={`${FIELD} ${error ? 'border-status-error' : 'border-border'}`}
        />
        <div className="mt-1 flex items-start justify-between gap-3 text-xs">
          {error ? (
            <p className="text-status-error-text">{error}</p>
          ) : (
            <p className="text-text-tertiary">{t('appeal_once_hint', 'You can appeal a decision only once.')}</p>
          )}
          <p className="shrink-0 tabular-nums text-text-tertiary">{reason.length}/{COMPLAINT_DEFAULTS.MAX_APPEAL_LENGTH}</p>
        </div>
      </form>
    </Modal>
  );
};

export default AppealModal;
