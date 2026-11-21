import { useTranslation } from 'react-i18next';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../../../common/components/ui/Button.jsx';

/** Shared step footer: an optional hint, a "Back" button and the step's primary action. */
const CheckoutStepFooter = ({ onBack, backLabel, backDisabled = false, hint = null, children }) => {
  const { t } = useTranslation();
  return (
    <div className="border-t border-border-light px-5 py-5 sm:px-6">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Button variant="ghost" onClick={onBack} disabled={backDisabled}>
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          <span>{backLabel || t('back', 'Geri')}</span>
        </Button>
        {/* The hint sits under the primary action it explains (why it is disabled). */}
        <div className="flex flex-col gap-2 sm:items-end [&>button]:w-full sm:[&>button]:w-auto">
          {children}
          {hint && (
            <p className="flex items-center gap-1.5 text-sm text-text-tertiary" role="status">
              <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span>{hint}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutStepFooter;
