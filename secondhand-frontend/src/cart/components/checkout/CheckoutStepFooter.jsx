import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../../common/components/ui/Button.jsx';

/** Shared step footer: an optional hint, a "Back" button and the step's primary action. */
const CheckoutStepFooter = ({ onBack, backLabel, backDisabled = false, hint = null, children }) => {
  const { t } = useTranslation();
  return (
    <div className="border-t border-border-light px-5 py-4 sm:px-6">
      {hint && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-text-secondary" role="status">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
          <span>{hint}</span>
        </div>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between [&>button]:w-full sm:[&>button]:w-auto">
        <Button variant="ghost" onClick={onBack} disabled={backDisabled}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          <span>{backLabel || t('back', 'Geri')}</span>
        </Button>
        {children}
      </div>
    </div>
  );
};

export default CheckoutStepFooter;
