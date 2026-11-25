import { useTranslation } from 'react-i18next';
import { agreementLabel } from '../agreements.js';
import { Alert, Button } from '../../common/components/ui/index.js';

const AgreementsSection = ({
  agreements,
  acceptedAgreements,
  onToggle,
  onRead,
  error
}) => {
  const { t } = useTranslation();

  if (!agreements?.length) return null;

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-text-primary">{t('agreements', 'Sözleşmeler')}</h3>
        <p className="mt-0.5 text-sm text-text-secondary">
          {t('you_must_accept_all_agreements_below_to_', 'Devam etmek için aşağıdaki sözleşmeleri onaylamanız gerekir.')}
        </p>
      </div>

      <div className="space-y-2">
        {agreements.map((agreement) => {
          const isChecked = acceptedAgreements.has(agreement.agreementId);
          const inputId = `agreement-${agreement.agreementId}`;
          const label = agreementLabel(t, agreement.agreementType);
          return (
            <div
              key={agreement.agreementId}
              className={`flex items-center justify-between gap-3 rounded border px-3 py-2.5 transition-colors duration-150 ${isChecked
                  ? 'border-accent-teal bg-accent-teal-50'
                  : 'border-border-light bg-background-primary hover:border-border'
                }`}
            >
              <label htmlFor={inputId} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  id={inputId}
                  checked={isChecked}
                  onChange={() => onToggle(agreement.agreementId)}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded-sm border-border focus:ring-2 focus:ring-border-focus"
                />
                <span className={`truncate text-sm font-medium ${isChecked ? 'text-accent-teal-800' : 'text-text-primary'}`}>
                  {label}
                </span>
              </label>
              <Button variant="ghost" size="sm" onClick={() => onRead(agreement)} className="shrink-0">
                {t('read', 'Oku')}
              </Button>
            </div>
          );
        })}
      </div>

      {error && <Alert type="error" message={error} />}
    </div>
  );
};

export default AgreementsSection;