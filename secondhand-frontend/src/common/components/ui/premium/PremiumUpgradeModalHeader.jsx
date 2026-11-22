import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

const PremiumUpgradeModalHeader = ({ featureHint, steps, step, onClose }) => {
  const { t } = useTranslation();

  return (
    <header className="px-6 pb-2 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-primary">
            {t('premium_membership', 'Premium Üyelik')}
          </h2>
          <p className="mt-0.5 text-sm text-text-tertiary">
            {featureHint ?? t('premium_modal_subtitle', 'Ayrıcalıklı teslimat, vitrin ve AI gücü')}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close', 'Kapat')}
          className="cursor-pointer rounded p-1.5 text-text-tertiary transition-colors duration-150 hover:bg-background-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <ol className="mt-3 flex items-center gap-2 text-sm tabular-nums">
        {steps.map(({ id, label }, index) => (
          <li
            key={id}
            className={`flex items-center gap-2 ${step === id ? 'font-medium text-text-primary' : 'text-text-tertiary'}`}
            aria-current={step === id ? 'step' : undefined}
          >
            {index > 0 && <span className="text-text-muted" aria-hidden>/</span>}
            <span>{id}. {label}</span>
          </li>
        ))}
      </ol>
    </header>
  );
};

export default PremiumUpgradeModalHeader;
