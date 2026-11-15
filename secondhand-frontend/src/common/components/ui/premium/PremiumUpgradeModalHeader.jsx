import { useTranslation } from 'react-i18next';
import { Sparkles, X } from 'lucide-react';
import Badge from '../Badge.jsx';

const PremiumUpgradeModalHeader = ({ featureHint, steps, step, onClose }) => {
  const { t } = useTranslation();

  return (
    <header className="border-b border-border-light px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary text-white">
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">
                {t('premium_membership', 'Premium Üyelik')}
              </h2>
              <Badge variant="neutral" size="sm" className="font-semibold">
                PRO
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              {featureHint ?? t('premium_modal_subtitle', 'Ayrıcalıklı teslimat, vitrin ve AI gücü')}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close', 'Kapat')}
          className="cursor-pointer rounded p-1.5 text-text-tertiary transition-colors hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <ol className="mt-3.5 flex items-center gap-3 border-t border-border-light pt-3 text-xs">
        {steps.map(({ id, label }, index) => (
          <li
            key={id}
            className="flex items-center gap-2"
            aria-current={step === id ? 'step' : undefined}
          >
            {index > 0 && <span className="h-px w-6 bg-border" aria-hidden />}
            <span
              className={`inline-flex items-center gap-1.5 tabular-nums ${
                step === id
                  ? 'font-semibold text-text-primary'
                  : step > id
                    ? 'text-text-secondary'
                    : 'text-text-tertiary'
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  step === id
                    ? 'bg-primary font-medium text-white'
                    : step > id
                      ? 'bg-background-tertiary text-text-secondary'
                      : 'bg-background-secondary text-text-tertiary'
                }`}
              >
                {id}
              </span>
              <span>{label}</span>
            </span>
          </li>
        ))}
      </ol>
    </header>
  );
};

export default PremiumUpgradeModalHeader;
