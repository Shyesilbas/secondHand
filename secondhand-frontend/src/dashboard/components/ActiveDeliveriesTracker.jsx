import React from 'react';
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
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Truck
        };
      case 'PROCESSING':
        return {
          label: t('status_processing', 'Hazırlanıyor'),
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: Package
        };
      default:
        return {
          label: t('status_confirmed', 'Sipariş Onaylandı'),
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Clock
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-200">
            <Truck className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              {t('active_deliveries', 'Aktif Sipariş & Teslimat Takibi')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t('active_deliveries_desc', 'Yolda veya hazırlanan siparişlerinizin anlık durumu')}
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.ORDERS}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
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
              className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {delivery.listingImageUrl ? (
                  <img
                    src={optimizeCloudinaryUrl(delivery.listingImageUrl, { width: 120, height: 120, crop: 'fill' })}
                    alt={delivery.listingTitle}
                    className="w-13 h-13 rounded-xl object-cover border border-slate-200/80 shrink-0"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${badge.bg}`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      #{delivery.orderNumber}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {delivery.listingTitle}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                    <span>{delivery.sellerName}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900">{formatCurrency(delivery.price, 'TRY')}</span>
                  </div>
                </div>
              </div>

              <Link
                to={ROUTES.ORDERS}
                className="shrink-0 p-2 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
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
