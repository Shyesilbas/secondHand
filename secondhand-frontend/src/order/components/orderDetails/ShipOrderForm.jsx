import { useTranslation } from "react-i18next";
import { useState } from 'react';
import Button from '../../../common/components/ui/Button.jsx';
import { FieldError } from '../../../common/components/forms/FormPrimitives.jsx';
import { getErrorMessage } from '../../../common/utils/errorUtils.js';

// The backend creates the shipment with the chosen provider and assigns the tracking number itself.
export const ShipOrderForm = ({
  onShip,
  carriers = [],
  isProcessing,
  CardComponent
}) => {
  const { t } = useTranslation();
  const [carrier, setCarrier] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!carrier) {
      setError(t('od_select_carrier_error', 'Lütfen bir kargo firması seçin.'));
      return;
    }
    setError('');
    try {
      await onShip({ providerName: carrier });
    } catch (err) {
      setError(getErrorMessage(err, t('od_ship_order_failed', 'Sipariş kargoya verilemedi.')));
    }
  };

  return (
    <CardComponent>
      <h3 className="mb-4 text-base font-semibold text-text-primary">
        {t('ship_this_order', 'Siparişi kargoya ver')}
      </h3>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <fieldset>
          <legend className="mb-2 text-sm text-text-secondary">
            {t('select_carrier', 'Kargo firması seçin')}
          </legend>
          {carriers.length ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup">
              {carriers.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  role="radio"
                  aria-checked={carrier === c.value}
                  onClick={() => {
                    setCarrier(c.value);
                    setError('');
                  }}
                  className={`h-10 rounded border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                    carrier === c.value
                      ? 'border-accent-teal bg-accent-teal-50 text-accent-teal-800 ring-1 ring-accent-teal'
                      : 'border-border bg-background-primary text-text-secondary hover:border-card-border-hover hover:text-text-primary'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-status-error-text">
              {t('od_no_carrier_available', 'Kullanılabilir kargo firması bulunamadı. Lütfen daha sonra tekrar deneyin.')}
            </p>
          )}
        </fieldset>

        <FieldError error={error} />

        <Button type="submit" disabled={isProcessing || !carriers.length} className="w-full">
          {isProcessing
            ? t('od_shipping_in_progress', 'Kargoya veriliyor...')
            : t('mark_as_shipped', 'Kargoya verildi olarak işaretle')}
        </Button>
      </form>
    </CardComponent>
  );
};
