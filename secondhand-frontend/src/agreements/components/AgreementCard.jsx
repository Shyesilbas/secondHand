import { useTranslation } from 'react-i18next';
import { Check, Loader2 } from 'lucide-react';
import { agreementLabel } from '../agreements.js';
import { formatDate } from '../../common/formatters.js';
import { Button } from '../../common/components/ui/index.js';

const AgreementCard = ({
  agreement,
  status = {},
  onAccept,
  accepting,
  onRead
}) => {
  const { t } = useTranslation();
  const isPending = status.status === 'pending' || status.status === 'outdated';
  const updatedLabel = formatDate(agreement.updatedDate || agreement.createdDate);
  const acceptedLabel = status.acceptedDate ? formatDate(status.acceptedDate) : null;

  return (
    <li className="flex flex-col gap-3 p-4 transition-colors duration-150 hover:bg-background-secondary sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-text-primary">
          {agreementLabel(t, agreement.agreementType)}
        </h2>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-text-tertiary">
          <span className={`inline-flex items-center gap-1.5 ${isPending ? 'font-medium text-status-warning-text' : 'text-text-tertiary'}`}>
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${isPending ? 'bg-status-warning' : 'bg-status-success'}`}
              aria-hidden
            />
            <span>{status.text}</span>
            {acceptedLabel && (
              <span className="tabular-nums text-text-tertiary">· {acceptedLabel}</span>
            )}
          </span>

          {agreement.version && (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums">v{agreement.version}</span>
            </>
          )}

          {updatedLabel && (
            <>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{updatedLabel}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onRead(agreement)}>
          {t('read_agreement', 'Sözleşmeyi Oku')}
        </Button>

        {isPending && (
          <Button size="sm" disabled={accepting} onClick={() => onAccept(agreement)}>
            {accepting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" strokeWidth={1.5} aria-hidden />
                <span>{t('accepting', 'Onaylanıyor...')}</span>
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
                <span>{t('accept', 'Kabul Et')}</span>
              </>
            )}
          </Button>
        )}
      </div>
    </li>
  );
};

export default AgreementCard;