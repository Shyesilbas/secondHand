import {BarChart2, Check, Crown, Package, Truck, Zap} from 'lucide-react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {membershipService} from '../../services/membershipService';
import {useNotification} from '../../../notification/NotificationContext.jsx';
import ReactDOM from 'react-dom';

const FEATURES = [
  {
    icon: Zap,
    label: 'Aura AI',
    free: 'Günlük 4 mesaj',
    premium: 'Günlük 10 mesaj',
  },
  {
    icon: Package,
    label: 'AI İlan Oluşturma',
    free: 'Aylık 1 hak',
    premium: 'Aylık 4 hak',
  },
  {
    icon: Crown,
    label: 'Showcase Slot',
    free: '1 slot',
    premium: '3 slot',
  },
  {
    icon: BarChart2,
    label: 'Gelişmiş Analitik',
    free: 'Temel görünüm',
    premium: 'Tam erişim',
  },
  {
    icon: Truck,
    label: 'Hızlı Teslimat',
    free: '3 iş günü',
    premium: '1 iş günü',
  },
  {
    icon: Zap,
    label: 'Sipariş İşleme',
    free: 'Standart',
    premium: '2x Daha Hızlı',
  },
];

const PremiumUpgradeModal = ({ isOpen, onClose, featureHint }) => {
  const queryClient = useQueryClient();
  const { showSuccess } = useNotification();

  const { mutate: upgrade, isPending, error } = useMutation({
    mutationFn: membershipService.upgradeToPremium,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership'] });
      showSuccess('Premium Üyelik', 'Premium planına başarıyla geçiş yaptınız!');
      onClose?.();
    },
  });

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center px-4"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <div className="w-full max-w-sm bg-card-bg rounded-2xl border border-border-light shadow-md overflow-hidden animate-scale-in">

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border-light">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary-light">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Premium Üyelik
                </h2>
                <p className="text-xs text-text-muted">
                  {featureHint ?? 'Tüm özelliklere erişin'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-text-muted hover:bg-background-secondary transition cursor-pointer"
              aria-label="Kapat"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Feature listesi */}
        <div className="px-5 py-3">
          {FEATURES.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.label}
                className="flex items-center justify-between py-2.5 border-b border-border-light last:border-0"
              >
                <div className="flex items-center gap-2.5">
                  <IconComponent className="h-4 w-4 text-text-muted shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-text-primary">{feature.label}</p>
                    <p className="text-caption text-text-muted">{feature.free}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-primary">{feature.premium}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-border-light bg-background-secondary">

          {/* Fiyat */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-text-primary">Aylık ücret</p>
              <p className="text-caption text-text-muted">İstediğin an iptal et</p>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-text-primary">₺100</span>
              <span className="text-xs text-text-muted">/ay</span>
            </div>
          </div>

          {/* Hata */}
          {error && (
            <p className="text-caption text-status-error mb-2">
              {error.response?.data?.message ?? 'Bir hata oluştu.'}
            </p>
          )}

          {/* CTA */}
          <button
            onClick={() => upgrade()}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover transition disabled:opacity-60 cursor-pointer"
          >
            <Crown className="h-4 w-4" />
            {isPending ? 'İşleniyor…' : 'E-Cüzdanla Öde'}
          </button>

          <button
            onClick={onClose}
            className="w-full mt-2 rounded-lg py-2 text-xs font-medium text-text-muted hover:text-text-secondary transition cursor-pointer"
          >
            Vazgeç
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default PremiumUpgradeModal;
