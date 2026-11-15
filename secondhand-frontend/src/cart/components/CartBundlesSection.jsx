import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Check, ShoppingBag } from 'lucide-react';
import { Button, Card } from '../../common/components/ui/index.js';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import { formatBundleValue } from '../utils/pricedLines.js';

const CartBundlesSection = ({ unlockedBundles, pendingBundles, currency }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      {unlockedBundles.length > 0 && (
        <div className="space-y-2.5">
          {unlockedBundles.map((a) => (
            <Card
              key={a.campaignId}
              padding="compact"
              className="flex items-center justify-between gap-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Check className="h-4 w-4 shrink-0 text-status-success-icon" strokeWidth={2} />
                <div className="min-w-0">
                  <span className="mr-1 font-semibold text-text-primary">
                    {a.sellerName || t('seller', 'Satıcı')} {t('bundle_unlocked', 'Paket İndirimi')}:
                  </span>
                  <span className="text-text-secondary">
                    {t('bundle_discount_applied_value_text', {
                      defaultValue: '{{count}} ürün için {{discount}} indirim uygulandı.',
                      count: a.qualifyingQuantity,
                      discount: formatBundleValue(a, formatCurrency, currency)
                    })}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate(ROUTES.USER_PROFILE(a.sellerId))}
                className="shrink-0 text-sm font-medium text-text-secondary hover:text-text-primary hover:underline"
              >
                {t('view_seller', 'Satıcıyı Gör')}
              </button>
            </Card>
          ))}
        </div>
      )}

      {pendingBundles.length > 0 && (
        <div className="space-y-3">
          {pendingBundles.map((s) => {
            const progress = (s.qualifyingQuantity / s.minQuantity) * 100;
            return (
              <Card key={s.campaignId} padding="normal">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-secondary">
                        {t('exclusive_bundle_from', 'Özel Satıcı Paketi:')}{' '}
                        <button
                          type="button"
                          onClick={() => navigate(ROUTES.USER_PROFILE(s.sellerId))}
                          className="font-semibold text-text-primary hover:underline"
                        >
                          {s.sellerName || t('seller', 'Satıcı')}
                        </button>
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-text-secondary">
                      {t('add', 'Ekle:')}{' '}
                      <strong className="text-text-primary">
                        {s.remainingQuantity} {t('more_item', 'ürün daha')}
                      </strong>{' '}
                      → sepette{' '}
                      <span className="font-semibold text-status-success-text">
                        {formatBundleValue(s, formatCurrency, currency)} indirim
                      </span>{' '}
                      kazanın.
                    </p>

                    <div className="mt-2.5 space-y-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-background-tertiary">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm tabular-nums text-text-muted">
                        <span>{s.qualifyingQuantity} {t('items_in_cart', 'ürün sepette')}</span>
                        <span>Hedef: {s.minQuantity} {t('items', 'ürün')}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(ROUTES.USER_PROFILE(s.sellerId))}
                    className="shrink-0 self-start sm:self-center"
                  >
                    <ShoppingBag className="h-3.5 w-3.5 text-text-secondary" />
                    <span>{t('complete_bundle', 'Paketi Tamamla')}</span>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
};

export default CartBundlesSection;
