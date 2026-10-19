import { motion } from 'framer-motion';
import { Truck, Package, Clock, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/common/constants/routes';
import { formatCurrency } from '@/common/formatters';
import { optimizeCloudinaryUrl } from '@/common/utils/imageOptimizer.js';
import { useTranslation } from 'react-i18next';

const ActiveDeliveriesTracker = ({ activeDeliveries = [] }) => {
  const { t } = useTranslation();

  if (!activeDeliveries || activeDeliveries.length === 0) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SHIPPED':
        return {
          label: t('status_shipped', 'Kargoya Verildi'),
          bg: 'bg-background-secondary text-text-primary border-border',
          icon: Truck
        };
      case 'PROCESSING':
        return {
          label: t('status_processing', 'Hazırlanıyor'),
          bg: 'bg-background-secondary text-status-warning-text border-border',
          icon: Package
        };
      default:
        return {
          label: t('status_confirmed', 'Sipariş Onaylandı'),
          bg: 'bg-background-secondary text-text-primary border-border',
          icon: Clock
        };
    }
  };

  return (
    <div className="bg-background-primary rounded border border-border p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Truck className="h-5 w-5 shrink-0 text-text-primary" strokeWidth={1.5} aria-hidden />
          <div>
            <h3 className="text-sm font-semibold text-text-primary tracking-tight">
              {t('active_deliveries', 'Aktif Sipariş & Teslimat Takibi')}
            </h3>
            <p className="text-xs text-text-tertiary font-medium">
              {t('active_deliveries_desc', 'Yolda veya hazırlanan siparişlerinizin anlık durumu')}
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.MY_ORDERS}
          className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors"
        >
          <span>{t('all_orders', 'Tüm Siparişler')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {activeDeliveries.map((delivery, idx) => {
          const badge = getStatusBadge(delivery.status);
          const BadgeIcon = badge.icon;
          return (
            <motion.div
              key={delivery.orderId || idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-4 rounded bg-background-secondary/70 hover:bg-background-secondary border border-border transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {delivery.listingImageUrl ? (
                  <img
                    src={optimizeCloudinaryUrl(delivery.listingImageUrl, { width: 120, height: 120, crop: 'fill' })}
                    alt={delivery.listingTitle}
                    className="w-13 h-13 rounded object-cover border border-border shrink-0"
                  />
                ) : (
                  <Package className="shrink-0 h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-medium border ${badge.bg}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-xs font-semibold text-text-muted">
                      #{delivery.orderNumber}
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-text-primary truncate">
                    {delivery.listingTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-text-tertiary font-medium mt-0.5">
                    <span>{delivery.sellerName}</span>
                    <span>•</span>
                    <span className="font-semibold text-text-primary">{formatCurrency(delivery.price, 'TRY')}</span>
                  </div>
                </div>
              </div>

              <Link
                to={delivery.orderId ? ROUTES.PROFILE_ORDER_SHIPMENT(delivery.orderId) : ROUTES.MY_ORDERS}
                className="shrink-0 p-2 text-text-muted hover:text-text-primary hover:bg-background-tertiary rounded border border-transparent hover:border-border transition-all"
                title="Sipariş Detayı"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveDeliveriesTracker;
