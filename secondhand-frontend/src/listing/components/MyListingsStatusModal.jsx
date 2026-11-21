import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { EyeOff, PlayCircle } from 'lucide-react';
import Modal from '../../common/components/ui/Modal.jsx';
import Button from '../../common/components/ui/Button.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { parseError } from '../../common/errorHandler.js';
import { listingService } from '../services/listingService.js';

// Seller-wide status changes. Each one covers every listing in its source status on every page,
// independent of select mode and paging; the backend runs it in one transaction.
const OPTIONS = [
  {
    id: 'reactivate',
    icon: PlayCircle,
    title: 'status_update_reactivate_title',
    desc: 'status_update_reactivate_desc',
    done: 'bulk_reactivated',
    run: () => listingService.reactivateAllInactive(),
  },
  {
    id: 'deactivate',
    icon: EyeOff,
    title: 'status_update_deactivate_title',
    desc: 'status_update_deactivate_desc',
    done: 'bulk_deactivated',
    run: () => listingService.deactivateAllActive(),
  },
];

const MyListingsStatusModal = ({ isOpen, onClose, onDone }) => {
  const { t } = useTranslation();
  const notification = useNotification();
  const [choice, setChoice] = useState(OPTIONS[0].id);
  const [pending, setPending] = useState(false);
  const option = OPTIONS.find((item) => item.id === choice);

  const close = () => {
    if (pending) return;
    setChoice(OPTIONS[0].id);
    onClose();
  };

  const apply = async () => {
    setPending(true);
    try {
      const { updatedCount } = await option.run();
      if (updatedCount > 0) {
        notification.showSuccess(t('success'), t(option.done, { count: updatedCount }));
      } else {
        notification.showSuccess(t('status_update_none_title'), t('status_update_none_body'));
      }
      onDone();
      setChoice(OPTIONS[0].id);
      onClose();
    } catch (err) {
      const parsed = parseError(err);
      notification.showError(t('bulk_status_failed'), parsed.message, { errorCode: parsed.errorCode, autoClose: false });
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={close}
      size="sm"
      title={t('status_update')}
      description={t('status_update_desc')}
      footer={
        <>
          <Button variant="secondary" onClick={close} disabled={pending}>{t('cancel', 'Vazgeç')}</Button>
          <Button onClick={apply} disabled={pending}>{pending ? t('bulk_applying') : t('apply')}</Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">{t('status_update')}</legend>
        {OPTIONS.map((item) => {
          const Icon = item.icon;
          const selected = item.id === choice;
          return (
            <label
              key={item.id}
              className={`flex cursor-pointer items-start gap-3 rounded border p-4 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-border-focus ${
                selected ? 'border-accent-teal ring-1 ring-accent-teal' : 'border-border hover:border-card-border-hover'
              }`}
            >
              <input
                type="radio"
                name="status-update"
                value={item.id}
                checked={selected}
                onChange={() => setChoice(item.id)}
                className="sr-only"
              />
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${selected ? 'text-accent-teal' : 'text-text-tertiary'}`} strokeWidth={1.5} aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-text-primary">{t(item.title)}</span>
                <span className="mt-0.5 block text-sm text-text-secondary">{t(item.desc)}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </Modal>
  );
};

export default MyListingsStatusModal;
