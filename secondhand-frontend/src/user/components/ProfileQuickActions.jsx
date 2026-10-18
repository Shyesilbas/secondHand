import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useUserReviewStats } from '../../reviews/index.js';
import { ShoppingBag, Star, FileText, LifeBuoy, Shield, ChevronRight } from 'lucide-react';

const ActionLink = ({ to, icon: Icon, label, description }) => (
  <Link
    to={to}
    className="group flex items-center justify-between gap-3 rounded border border-border bg-background-primary p-3.5 sm:p-4 transition-colors hover:border-card-border-hover hover:bg-background-secondary/40"
  >
    <div className="flex items-center gap-3 min-w-0">
      <Icon className="h-5 w-5 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden="true" />
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-text-primary truncate">{label}</h3>
        <p className="text-xs text-text-muted truncate mt-0.5">{description}</p>
      </div>
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-text-muted group-hover:text-primary transition-colors" strokeWidth={1.5} aria-hidden="true" />
  </Link>
);

const ProfileQuickActions = ({ user }) => {
  const { t } = useTranslation();
  const reviewsSectionRef = useRef(null);
  const [reviewsVisible, setReviewsVisible] = useState(false);

  const { stats: reviewStats, loading: reviewStatsLoading } = useUserReviewStats(user?.id, {
    enabled: reviewsVisible
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setReviewsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (reviewsSectionRef.current) {
      observer.observe(reviewsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-2.5">
      <ActionLink
        to={ROUTES.MY_ORDERS}
        icon={ShoppingBag}
        label={t('my_orders', 'Siparişlerim')}
        description={t('view_order_history', 'Sipariş geçmişinizi ve durumlarını görüntüleyin')}
      />

      {/* Reviews section */}
      <div ref={reviewsSectionRef} className="rounded border border-border bg-background-primary overflow-hidden">
        <div className="flex items-center gap-3 p-3.5 sm:p-4">
          <Star className="h-5 w-5 shrink-0 text-text-secondary" strokeWidth={1.5} aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">{t('reviews_ratings', 'Değerlendirmeler & Puanlar')}</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {reviewStatsLoading
                ? t('loading', 'Yükleniyor...')
                : reviewStats
                ? `${reviewStats.totalReviews || 0} ${t('reviews_lower', 'değerlendirme')} · ${(reviewStats.averageRating || 0).toFixed(1)} ${t('average_short', 'ort.')}`
                : t('your_review_activity', 'Değerlendirme hareketleriniz')}
            </p>
          </div>
        </div>

        <div className="border-t border-border-light divide-y divide-border-light text-xs sm:text-sm">
          <Link
            to={ROUTES.REVIEWS_RECEIVED(user?.id)}
            className="flex items-center justify-between px-4 py-2.5 text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors group"
          >
            <span className="font-medium">{t('reviews_i_received', 'Aldığım Değerlendirmeler')}</span>
            <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
          </Link>

          <Link
            to={ROUTES.REVIEWS_GIVEN(user?.id)}
            className="flex items-center justify-between px-4 py-2.5 text-text-secondary hover:bg-background-secondary hover:text-text-primary transition-colors group"
          >
            <span className="font-medium">{t('reviews_i_gave', 'Yaptığım Değerlendirmeler')}</span>
            <ChevronRight className="h-3.5 w-3.5 text-text-muted group-hover:text-primary transition-colors" strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <ActionLink
        to={ROUTES.AGREEMENTS_ALL}
        icon={FileText}
        label={t('terms_agreements', 'Sözleşmeler ve Koşullar')}
        description={t('view_legal_docs', 'Platform sözleşmelerini ve yasal metinleri inceleyin')}
      />

      <ActionLink
        to={ROUTES.COMPLAINTS}
        icon={LifeBuoy}
        label={t('support_complaints', 'Destek ve Şikayetler')}
        description={t('get_help_or_file_complaint', 'Yardım alın veya bildirim oluşturun')}
      />

      <ActionLink
        to={ROUTES.SECURITY}
        icon={Shield}
        label={t('security_settings', 'Güvenlik ve Oturumlar')}
        description={t('manage_security_options', 'Hesap güvenliğini ve giriş yapmış cihazları yönetin')}
      />
    </div>
  );
};

export default ProfileQuickActions;