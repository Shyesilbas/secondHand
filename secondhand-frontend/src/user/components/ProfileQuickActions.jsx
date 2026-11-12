import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useUserReviewStats } from '../../reviews/index.js';
import {
  ChevronRight,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  MessageSquareQuote,
  ShoppingBag,
  Star
} from 'lucide-react';

const ActionRow = ({ to, icon: Icon, label, description, badge }) => (
  <Link
    to={to}
    className="group -mx-2 flex items-center justify-between gap-4 rounded px-2 py-3.5 first:pt-0 last:pb-0 transition-colors hover:bg-background-secondary/60"
  >
    <div className="flex items-start gap-3 min-w-0">
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-text-secondary"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-medium text-text-primary">{label}</h3>
          {badge && (
            <span className="rounded-sm bg-background-secondary px-1.5 py-0.5 text-xs font-medium tabular-nums text-text-secondary">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-text-secondary">{description}</p>
      </div>
    </div>
    <ChevronRight
      className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text-primary"
      strokeWidth={1.5}
      aria-hidden="true"
    />
  </Link>
);

const ProfileQuickActions = ({ user }) => {
  const { t } = useTranslation();

  const { stats: reviewStats, loading: reviewStatsLoading } = useUserReviewStats(user?.id, {
    enabled: Boolean(user?.id)
  });

  const reviewBadge =
    !reviewStatsLoading && reviewStats
      ? `${reviewStats.totalReviews || 0} · ${(reviewStats.averageRating || 0).toFixed(1)} / 5`
      : null;

  return (
    <div className="divide-y divide-border-light">
      <ActionRow
        to={ROUTES.DASHBOARD}
        icon={LayoutDashboard}
        label={t('account_hub', 'Account Hub')}
        description={t('account_hub_desc', 'Hesap özeti, vitrinleriniz, üyelik planı ve tüm yönetim araçları')}
      />

      <ActionRow
        to={ROUTES.MY_ORDERS}
        icon={ShoppingBag}
        label={t('my_orders', 'Siparişlerim')}
        description={t('view_order_history', 'Sipariş geçmişinizi ve teslimat durumlarını görüntüleyin')}
      />

      <ActionRow
        to={ROUTES.REVIEWS_RECEIVED(user?.id)}
        icon={Star}
        label={t('reviews_i_received', 'Aldığım Değerlendirmeler')}
        description={t('reviews_received_desc', 'Diğer kullanıcıların hakkınızdaki yorumları ve puanları')}
        badge={reviewBadge}
      />

      <ActionRow
        to={ROUTES.REVIEWS_GIVEN(user?.id)}
        icon={MessageSquareQuote}
        label={t('reviews_i_gave', 'Yaptığım Değerlendirmeler')}
        description={t('reviews_given_desc', 'Satın aldığınız ilanlar için bıraktığınız değerlendirmeler')}
      />

      <ActionRow
        to={ROUTES.AGREEMENTS_ALL}
        icon={FileText}
        label={t('terms_agreements', 'Sözleşmeler ve Koşullar')}
        description={t('view_legal_docs', 'Onayladığınız platform sözleşmelerini ve yasal metinleri inceleyin')}
      />

      <ActionRow
        to={ROUTES.COMPLAINTS}
        icon={LifeBuoy}
        label={t('support_complaints', 'Destek ve Şikayetler')}
        description={t('get_help_or_file_complaint', 'Şikayet kayıtlarınızı görüntüleyin veya yeni bildirim oluşturun')}
      />
    </div>
  );
};

export default ProfileQuickActions;
