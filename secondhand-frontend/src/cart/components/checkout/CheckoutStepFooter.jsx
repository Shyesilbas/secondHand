import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import Button from '../../../common/components/ui/Button.jsx';

/** Shared step footer: an optional hint, a "Back" button and the step's primary action. */
const CheckoutStepFooter = ({ onBack, backLabel, backDisabled = false, hint = null, children }) => {
  const { t } = useTranslation();
  return (
    <div className="border-t border-border-light px-5 py-4 sm:px-6">
      {hint && <p className="mb-3 text-sm text-text-secondary">{hint}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
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
