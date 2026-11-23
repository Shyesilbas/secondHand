import { useTranslation } from 'react-i18next';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import PageHeader from '../../common/components/ui/PageHeader.jsx';
import Card from '../../common/components/ui/Card.jsx';
import Alert from '../../common/components/ui/Alert.jsx';
import Button from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { useFeeSchedule } from '../hooks/useFeeSchedule.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { formatCurrency } from '../../common/formatters.js';

const ROW = 'flex items-center justify-between gap-4 py-2.5';
const LABEL = 'text-sm text-text-secondary';
const VALUE = 'text-sm font-medium tabular-nums text-text-primary';

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('tr-TR') : '');

const bandLabel = (band, t) => (band.maxAmount == null
  ? `${formatCurrency(band.minAmount, 'TRY')} ${t('fees_and_above', 've üzeri')}`
  : `${formatCurrency(band.minAmount, 'TRY')} - ${formatCurrency(Number(band.maxAmount) - 0.01, 'TRY')}`);

const rateFor = (bands, amount) => {
  const band = [...bands].reverse().find((b) => Number(b.minAmount) <= amount);
  return band ? Number(band.ratePercent) : 0;
};

const NOTE = 'text-sm leading-relaxed text-text-secondary';
const H2 = 'text-lg font-semibold text-text-primary';

const FeesPage = () => {
  const { t } = useTranslation();
  const { schedule, isLoading, error, refetch } = useFeeSchedule();
  const { enums } = useEnums();

  const typeLabel = (type) => {
    const option = (enums?.listingTypes || []).find((item) => item.value === type);
    return option?.label || type;
  };

  return (
    <div className="min-h-screen bg-background-page">
      <PageContainer className="pt-8">
        <PageHeader
          title={t('fees_title', 'Komisyon ve ücretler')}
          subtitle={t('fees_subtitle', 'Satış, ilan, vitrin ve kargo için uygulanan ücretler')}
        />
      </PageContainer>

      <PageContainer className="py-8">
        {error && (
          <Alert
            type="error"
            message={t('fees_load_failed', 'Ücret bilgileri yüklenemedi.')}
            action={<Button variant="secondary" size="sm" onClick={() => refetch()}>{t('retry', 'Tekrar dene')}</Button>}
          />
        )}

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        )}

        {schedule && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold text-text-primary">{t('fees_commission_title', 'Satış komisyonu')}</h2>
              <p className="mt-1 text-sm text-text-tertiary">
                {t('fees_commission_desc', 'Araç ve emlak dışındaki ilanlarda ilan ücreti alınmaz; satıştan, ürün tutarına göre komisyon kesilir.')}
              </p>
              <div className="mt-4 divide-y divide-border-light">
                {schedule.commission.bands.map((band) => (
                  <div key={band.minAmount} className={ROW}>
                    <span className={LABEL}>{bandLabel(band, t)}</span>
                    <span className={VALUE}>%{Number(band.ratePercent)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-sm text-text-tertiary">
                {t('fees_commission_base', 'Komisyon, kalem bazında alıcının ödediği tutar ve platform kupon payı üzerinden hesaplanır.')}
                {' '}
                {t('fees_commission_since', '{{date}} tarihinden itibaren oluşturulan siparişlere uygulanır.', { date: formatDate(schedule.commission.effectiveFrom) })}
              </p>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary">{t('fees_listing_title', 'İlan oluşturma ücreti')}</h2>
              <p className="mt-1 text-sm text-text-tertiary">
                {t('fees_listing_desc', 'Yalnızca şu ilan türleri için alınır; bu ilanlardan satış komisyonu kesilmez:')}
                {' '}
                {schedule.listingFee.feeBearingTypes.map(typeLabel).join(', ')}
              </p>
              <div className="mt-4 divide-y divide-border-light">
                <div className={ROW}>
                  <span className={LABEL}>{t('creation', 'İlan ücreti')}</span>
                  <span className={VALUE}>{formatCurrency(schedule.listingFee.creationFee, 'TRY')}</span>
                </div>
                <div className={ROW}>
                  <span className={LABEL}>{t('tax', 'Vergi')} (%{Number(schedule.listingFee.taxPercentage)})</span>
                  <span className={VALUE}>
                    {formatCurrency(Number(schedule.listingFee.totalFee) - Number(schedule.listingFee.creationFee), 'TRY')}
                  </span>
                </div>
                <div className={ROW}>
                  <span className="text-sm font-semibold text-text-primary">{t('total', 'Toplam')}</span>
                  <span className="text-sm font-semibold tabular-nums text-text-price">{formatCurrency(schedule.listingFee.totalFee, 'TRY')}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary">{t('fees_shipping_title', 'Kargo ücreti')}</h2>
              <p className="mt-1 text-sm text-text-tertiary">
                {t('fees_shipping_desc', 'Kargo ile teslim edilen siparişlerde alıcıdan sipariş başına bir kez alınır; elden teslimde alınmaz. Sipariş tamamen iptal edilirse iade edilir.')}
              </p>
              <div className="mt-4">
                <span className="text-xl font-semibold tabular-nums text-text-price">{formatCurrency(schedule.shippingFee, 'TRY')}</span>
              </div>
              {schedule.freeShippingThreshold != null ? (
                <p className={`${NOTE} mt-3`}>
                  {t('fees_free_shipping', 'Bir satıcıdan yaptığınız alışverişin ürün tutarı (kupon sonrası) {{amount}} ve üzerindeyse kargo ücretsizdir. Bu durumda kargo ücretini satıcı karşılar ve satıcının ödemesinden kesilir.', { amount: formatCurrency(schedule.freeShippingThreshold, 'TRY') })}
                </p>
              ) : null}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-text-primary">{t('showcase', 'Vitrin')}</h2>
              <p className="mt-1 text-sm text-text-tertiary">
                {t('fees_showcase_desc', 'Vitrin fiyatları değişmedi.')}
              </p>
              <div className="mt-4 divide-y divide-border-light">
                <div className={ROW}>
                  <span className={LABEL}>{t('daily_cost', 'Günlük ücret')}</span>
                  <span className={VALUE}>{formatCurrency(schedule.showcase.dailyCost, 'TRY')}</span>
                </div>
                <div className={ROW}>
                  <span className={LABEL}>{t('tax', 'Vergi')}</span>
                  <span className={VALUE}>%{Number(schedule.showcase.taxPercentage)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {schedule && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className={H2}>{t('fees_how_title', 'Komisyon nasıl hesaplanır?')}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li className={NOTE}>{t('fees_how_item', 'Komisyon siparişin tamamına değil, her ürün kalemine ayrı uygulanır; oran kalemin tutarına göre seçilir.')}</li>
                <li className={NOTE}>{t('fees_how_base', 'Baz tutar, alıcının o kalem için ödediği tutar ile varsa platform kuponunun karşıladığı paydır. Satıcı kupon nedeniyle daha az komisyon ödemez.')}</li>
                <li className={NOTE}>{t('fees_how_when', 'Komisyon satış tamamlanıp ödeme satıcıya aktarılırken kesilir; satıcı cüzdanına net tutar geçer.')}</li>
                <li className={NOTE}>{t('fees_how_shipping', 'Ücretsiz kargo uygulanan siparişlerde kargo ücreti, komisyondan sonra satıcının payından ayrıca düşülür; ödeme ekranında "Kargo kesintisi" olarak görünür.')}</li>
                <li className={NOTE}>{t('fees_how_refund', 'İptal veya iade edilen kalemde komisyon alınmaz.')}</li>
                <li className={NOTE}>{t('fees_how_date', 'Komisyon yalnızca belirtilen tarihten sonra oluşturulan siparişlere uygulanır; önceki siparişler etkilenmez.')}</li>
              </ul>
            </Card>

            <Card>
              <h2 className={H2}>{t('fees_example_title', 'Örnek hesaplamalar')}</h2>
              <div className="mt-3 divide-y divide-border-light">
                {[500, 2500, 12000].map((amount) => {
                  const rate = rateFor(schedule.commission.bands, amount);
                  const commission = (amount * rate) / 100;
                  const freeShipping = schedule.freeShippingThreshold != null && amount >= Number(schedule.freeShippingThreshold);
                  const shippingDeduction = freeShipping ? Number(schedule.shippingFee) : 0;
                  return (
                    <div key={amount} className="py-3">
                      <div className={ROW}>
                        <span className={LABEL}>{t('fees_example_sale', 'Satış tutarı')}</span>
                        <span className={VALUE}>{formatCurrency(amount, 'TRY')}</span>
                      </div>
                      <div className={ROW}>
                        <span className={LABEL}>{t('fees_example_commission', 'Komisyon')} (%{rate})</span>
                        <span className={VALUE}>-{formatCurrency(commission, 'TRY')}</span>
                      </div>
                      {freeShipping ? (
                        <div className={ROW}>
                          <span className={LABEL}>{t('fees_example_shipping', 'Kargo kesintisi (ücretsiz kargo)')}</span>
                          <span className={VALUE}>-{formatCurrency(shippingDeduction, 'TRY')}</span>
                        </div>
                      ) : null}
                      <div className={ROW}>
                        <span className="text-sm font-semibold text-text-primary">{t('fees_example_net', 'Size aktarılan')}</span>
                        <span className="text-sm font-semibold tabular-nums text-text-price">{formatCurrency(amount - commission - shippingDeduction, 'TRY')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card>
              <h2 className={H2}>{t('fees_who_title', 'Kim neyi öder?')}</h2>
              <div className="mt-3 divide-y divide-border-light">
                <div className="py-3">
                  <p className="text-sm font-medium text-text-primary">{t('fees_who_seller', 'Satıcı')}</p>
                  <p className={NOTE}>{t('fees_who_seller_desc', 'Araç ve emlak ilanında ilan oluşturma ücreti; diğer ilanlarda satış başına komisyon. Vitrin tercih ederse vitrin ücreti. Ücretsiz kargo eşiğini aşan siparişlerde kargo ücretini de satıcı karşılar.')}</p>
                </div>
                <div className="py-3">
                  <p className="text-sm font-medium text-text-primary">{t('fees_who_buyer', 'Alıcı')}</p>
                  <p className={NOTE}>{t('fees_who_buyer_desc', 'Ürün bedeli ve kargo ile teslimde her satıcı siparişi için kargo ücreti (ücretsiz kargo eşiğinin altındaysa). Alıcıdan komisyon alınmaz; elden teslimde kargo ücreti yoktur.')}</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className={H2}>{t('fees_cancel_title', 'İptal, iade ve kupon')}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li className={NOTE}>{t('fees_cancel_shipping', 'Sipariş tüm kalemleriyle iptal edilirse kargo ücreti alıcıya iade edilir. Tek kalem iptalinde kargo ücreti iade edilmez.')}</li>
                <li className={NOTE}>{t('fees_cancel_listing', 'Ödenmiş ilan oluşturma ve vitrin ücretleri, ilan satılmasa da iade edilmez.')}</li>
                <li className={NOTE}>{t('fees_coupon_platform', 'Platform kuponlarının indirimi platform tarafından karşılanır ve satıcının brüt tutarına eklenir; satıcı bu nedenle zarar etmez.')}</li>
              </ul>
            </Card>
          </div>
        )}
      </PageContainer>
    </div>
  );
};

export default FeesPage;
