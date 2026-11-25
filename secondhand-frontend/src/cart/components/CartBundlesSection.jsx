import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Card } from '../../common/components/ui/index.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { formatCurrency } from '../../common/formatters.js';
import { formatBundleValue } from '../utils/pricedLines.js';

const CartBundlesSection = ({ unlockedBundles, pendingBundles, currency }) => {
  const { t } = useTranslation();

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
                <Check className="h-4 w-4 shrink-0 text-status-success-icon" strokeWidth={1.5} aria-hidden />
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
              <Link
                to={ROUTES.USER_PROFILE(a.sellerId)}
                className="shrink-0 rounded-sm text-sm font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              >
                {t('view_seller', 'Satıcıyı Gör')}
              </Link>
            </Card>
          ))}
        </div>
      )}

      {pendingBundles.length > 0 && (
        <div className="space-y-3">
          {pendingBundles.map((s) => {
            const progress = Math.min(100, (s.qualifyingQuantity / s.minQuantity) * 100);
            const discountText = formatBundleValue(s, formatCurrency, currency);
            return (
              <Card key={s.campaignId} padding="normal">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div>
                      <span className="text-sm font-semibold text-text-secondary">
                        {t('exclusive_bundle_from', 'Özel Satıcı Paketi:')}{' '}
                        <Link
                          to={ROUTES.USER_PROFILE(s.sellerId)}
                          className="rounded-sm font-semibold text-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                        >
                          {s.sellerName || t('seller', 'Satıcı')}
                        </Link>
                      </span>
                    </div>

                    <p className="mt-1.5 text-sm text-text-secondary">
                      {t('bundle_progress_label', {
                        defaultValue: '{{remaining}} ürün daha ekleyin, sepette {{discount}} indirim kazanın.',
                        remaining: s.remainingQuantity,
                        discount: discountText
                      })}
                    </p>

                    <div className="mt-2.5 space-y-1">
                      <div
                        role="progressbar"
                        aria-valuenow={s.qualifyingQuantity}
                        aria-valuemin={0}
                        aria-valuemax={s.minQuantity}
                        className="h-1.5 w-full overflow-hidden rounded-sm bg-background-tertiary"
                      >
                        <div
                          className="h-full bg-primary transition-[width] duration-150"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm tabular-nums text-text-tertiary">
                        <span>{s.qualifyingQuantity} {t('items_in_cart', 'ürün sepette')}</span>
                        <span>{t('bundle_target', 'Hedef')}: {s.minQuantity} {t('items', 'ürün')}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={ROUTES.USER_PROFILE(s.sellerId)}
                    className={`${buttonClasses('secondary', 'sm')} shrink-0 self-start sm:self-center`}
                  >
                    {t('complete_bundle', 'Paketi Tamamla')}
                  </Link>
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
