import { useTranslation } from 'react-i18next';

/**
 * Offer numbers as a row of label/value pairs. Seller stats carry `totalOffersReceived` and
 * `acceptanceRate`; buyer stats carry `totalOffersSent`.
 */
const OfferAnalyticsCard = ({ offerStats }) => {
  const { t } = useTranslation();
  if (!offerStats) return null;

  const isSeller = offerStats.totalOffersReceived != null;
  const items = [
    {
      id: 'total',
      label: isSeller ? t('dash_offers_received', 'Gelen') : t('dash_offers_sent', 'Gönderilen'),
      value: (isSeller ? offerStats.totalOffersReceived : offerStats.totalOffersSent) || 0
    },
    { id: 'pending', label: t('dash_offers_pending', 'Yanıt bekleyen'), value: offerStats.pendingOffers || 0, warn: offerStats.pendingOffers > 0 },
    { id: 'accepted', label: t('dash_offers_accepted', 'Kabul edilen'), value: offerStats.acceptedOffers || 0 },
  ];
  if (isSeller) {
    items.push({ id: 'rate', label: t('dash_offers_rate', 'Kabul oranı'), value: `${offerStats.acceptanceRate || 0}%` });
  }

  return (
    <dl className={`grid grid-cols-2 gap-4 ${isSeller ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
      {items.map(item => (
        <div key={item.id}>
          <dt className="text-xs text-text-tertiary">{item.label}</dt>
          <dd className={`mt-1 text-xl font-semibold tabular-nums ${item.warn ? 'text-status-warning-text' : 'text-text-primary'}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

export default OfferAnalyticsCard;
