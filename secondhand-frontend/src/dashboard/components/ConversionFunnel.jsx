import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Tag, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ConversionFunnel = ({ funnel }) => {
  const { t } = useTranslation();

  if (!funnel) return null;

  const steps = [
    {
      id: 'views',
      label: t('funnel_views', 'Görüntülenme'),
      value: funnel.totalViews || 0,
      icon: Eye,
      color: 'from-blue-500/20 to-indigo-500/20 text-indigo-600 border-indigo-200',
      pillBg: 'bg-indigo-50 text-indigo-700',
      conversion: funnel.viewToFavoriteRate ? `${funnel.viewToFavoriteRate}%` : '0%',
      conversionLabel: t('to_fav', 'Favoriye')
    },
    {
      id: 'favorites',
      label: t('funnel_favorites', 'Favoriye Ekleme'),
      value: funnel.totalFavorites || 0,
      icon: Heart,
      color: 'from-pink-500/20 to-rose-500/20 text-rose-600 border-rose-200',
      pillBg: 'bg-rose-50 text-rose-700',
      conversion: funnel.favoriteToOfferRate ? `${funnel.favoriteToOfferRate}%` : '0%',
      conversionLabel: t('to_offer', 'Teklife')
    },
    {
      id: 'offers',
      label: t('funnel_offers', 'Gelen Teklifler'),
      value: funnel.totalOffers || 0,
      icon: Tag,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 border-amber-200',
      pillBg: 'bg-amber-50 text-amber-700',
      conversion: funnel.overallConversionRate ? `${funnel.overallConversionRate}%` : '0%',
      conversionLabel: t('to_sale', 'Satışa')
    },
    {
      id: 'orders',
      label: t('funnel_orders', 'Tamamlanan Satış'),
      value: funnel.totalOrders || 0,
      icon: ShoppingBag,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-200',
      pillBg: 'bg-emerald-50 text-emerald-700',
      conversion: null
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {t('sales_funnel', 'Satış Hunisi & Dönüşüm Analizi')}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('funnel_desc', 'Ziyaretçilerin satın alma adımlarındaki ilerleme ve kayıp oranları')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-200">
          <span>{t('overall_rate', 'Genel Dönüşüm:')}</span>
          <span>%{funnel.overallConversionRate || 0}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className="relative p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${step.color} bg-gradient-to-br`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">
                    #{idx + 1}
                  </span>
                </div>

                <div className="text-2xl font-black text-slate-900 tracking-tight">
                  {step.value.toLocaleString()}
                </div>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">
                  {step.label}
                </div>
              </div>

              {step.conversion && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">{step.conversionLabel}</span>
                  <div className="flex items-center gap-1 font-bold text-slate-700">
                    <span>{step.conversion}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;
