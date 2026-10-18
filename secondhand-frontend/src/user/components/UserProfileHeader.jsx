import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import PageContainer from '@/common/components/layout/PageContainer';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import { FollowButton, FollowStats } from '../../follow/index.js';
import { formatDate } from '../../common/formatters.js';
import { ArrowLeft, Award, Calendar, ShieldCheck, Star, UserRound } from 'lucide-react';

const UserProfileHeader = ({
  user,
  isOwnProfile,
  reviewStats,
  greatSeller,
  greatSellerEligible
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const name = user?.name || '';
  const surname = user?.surname || '';
  const userInitials = `${name?.[0]?.toUpperCase() || ''}${surname?.[0]?.toUpperCase() || ''}` || 'U';
  const memberSince = formatDate(user?.accountCreationDate);
  const hasReviews = reviewStats && reviewStats.totalReviews > 0;
  const fullName = `${name} ${surname}`.trim() || t('marketplace_member', 'Pazar Yeri Üyesi');

  // Milestone calculations for Great Seller
  const minTry = Number(greatSeller?.minUnitPriceThreshold ?? 1500);
  const days = greatSeller?.rollingWindowDays ?? 60;
  const salesTarget = greatSeller?.qualifyingSalesTarget || 1;
  const revTarget = greatSeller?.distinctReviewerTarget || 1;
  const salesPct = Math.min(100, ((greatSeller?.qualifyingSalesLastWindow || 0) / salesTarget) * 100);
  const revPct = Math.min(100, ((greatSeller?.distinctReviewerCount || 0) / revTarget) * 100);
  const minRating = greatSeller?.minimumAverageRating ?? 4.7;
  const avg = greatSeller?.averageRating ?? 0;
  const ratingPct = greatSeller?.ratingMet ? 100 : Math.min(100, minRating ? (avg / minRating) * 100 : 0);

  return (
    <div className="bg-background-primary border-b border-border">
      <PageContainer className="py-4 sm:py-5">
        {/* Back navigation */}
        <div className="mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-primary transition-colors duration-150 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{t('back', 'Geri')}</span>
          </button>
        </div>

        {/* User Identity Section */}
        <div className="flex items-start gap-3.5 sm:gap-4">
          {/* Avatar (rounded-full per DESIGN.md) */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-primary text-white flex items-center justify-center select-none ring-2 ring-background-secondary shadow-xs">
              <span className="text-lg sm:text-xl font-semibold tracking-tight">
                {userInitials}
              </span>
            </div>
            {greatSellerEligible && (
              <span
                className="absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full bg-background-primary text-status-warning border border-border shadow-xs"
                title={t('great_seller', 'Harika Satıcı')}
              >
                <Award className="h-3 w-3" strokeWidth={1.5} />
              </span>
            )}
          </div>

          {/* User Meta Information */}
          <div className="flex-1 min-w-0">
            {/* Name & Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-base sm:text-lg font-semibold text-text-primary tracking-tight truncate">
                {fullName}
              </h1>
              {isOwnProfile && (
                <span className="px-1.5 py-0.2 bg-background-secondary text-text-muted border border-border text-[11px] font-medium rounded-sm">
                  {t('you', 'Siz')}
                </span>
              )}
              {greatSellerEligible && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-background-secondary text-text-secondary border border-border text-[11px] font-semibold rounded-sm">
                  <Award className="w-3 h-3 text-status-warning" strokeWidth={1.5} />
                  <span>{t('great_seller', 'Harika Satıcı')}</span>
                </span>
              )}
            </div>

            {/* Social / Rating info line: bullet-separated and single row */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-text-muted">
              {hasReviews && (
                <>
                  <div className="inline-flex items-center gap-1 whitespace-nowrap">
                    <Star className="w-3.5 h-3.5 text-status-warning fill-status-warning" strokeWidth={1.5} />
                    <span className="font-semibold text-text-primary tabular-nums">
                      {(reviewStats.averageRating || 0).toFixed(1)}
                    </span>
                    <span className="text-text-muted">
                      ({reviewStats.totalReviews})
                    </span>
                  </div>
                  <span className="text-border select-none" aria-hidden>•</span>
                </>
              )}
              <div className="inline-flex items-center whitespace-nowrap">
                <FollowStats userId={user.id} showIcon={false} className="text-xs" />
              </div>
              {memberSince && (
                <>
                  <span className="text-border select-none" aria-hidden>•</span>
                  <span className="inline-flex items-center gap-1 text-text-muted whitespace-nowrap">
                    <Calendar className="w-3.5 h-3.5 text-text-muted" strokeWidth={1.5} />
                    <span>{t('member_since', 'Üyelik tarihi:')} {memberSince}</span>
                  </span>
                </>
              )}
            </div>

            {/* Badges line */}
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <span className="inline-flex items-center gap-1 text-text-secondary font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-status-success" strokeWidth={1.5} />
                <span>{t('verified_profile', 'Doğrulanmış Profil')}</span>
              </span>
              <span className="text-border select-none" aria-hidden>•</span>
              <span className="inline-flex items-center gap-1 text-text-muted">
                <UserRound className="h-3 w-3 text-text-muted" strokeWidth={1.5} />
                <span>{t('seller_profile', 'Satıcı Profili')}</span>
              </span>
            </div>

            {/* Action buttons (only for visitors) */}
            {!isOwnProfile && (
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <FollowButton userId={user.id} size="sm" />
                <ContactSellerButton
                  listing={{
                    id: `user-chat-${user.id}`,
                    title: `${t('chat_with', 'Sohbet:')} ${fullName}`,
                    sellerId: user.id,
                    sellerName: name,
                    sellerSurname: surname
                  }}
                  isDirectChat={true}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded hover:bg-primary-hover transition-colors"
                />
                <ComplaintButton
                  targetUserId={user.id}
                  targetUserName={fullName}
                  targetUser={user}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-text-muted hover:text-status-error hover:bg-background-secondary rounded text-xs font-medium transition-colors border border-border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Integrated Great Seller Milestone row (clean, slim, non-breaking) */}
        {isOwnProfile && greatSeller ? (
          <div className="mt-3.5 pt-3 border-t border-border">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
              {/* Title & Status */}
              <div className="flex items-center gap-2 shrink-0">
                <Award className="h-4 w-4 text-status-warning shrink-0" strokeWidth={1.5} />
                <span className="text-xs font-semibold text-text-primary tracking-tight">
                  {t("great_seller_milestones", "Harika Satıcı Kriterleri")}
                </span>
                {greatSeller.eligible ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-status-success bg-background-secondary px-1.5 py-0.2 rounded-sm border border-border">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-success" aria-hidden />
                    <span>{t("completed", "Tamamlandı")}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-text-muted">
                    ({days} {t("days_window", "günlük pencere")})
                  </span>
                )}
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 flex-1 md:max-w-xl md:justify-end">
                {/* Satış */}
                <div
                  className="rounded border border-border bg-background-secondary px-2.5 py-1.5 min-w-0"
                  title={`${t("completed_checkout_try_lines_with_unit_p", "Min. birim tutarı:")} ₺${minTry.toLocaleString('tr-TR')}`}
                >
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-text-muted truncate">{t("sales", "Satış")}</span>
                    <span className="font-semibold text-text-primary tabular-nums shrink-0">
                      {greatSeller.qualifyingSalesLastWindow}/{greatSeller.qualifyingSalesTarget}
                    </span>
                  </div>
                  <div className="h-1 bg-background-tertiary rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${greatSeller.salesMet ? 'bg-status-success' : 'bg-primary'}`}
                      style={{ width: `${salesPct}%` }}
                    />
                  </div>
                </div>

                {/* Yorum */}
                <div className="rounded border border-border bg-background-secondary px-2.5 py-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-text-muted truncate">{t("reviews", "Yorum")}</span>
                    <span className="font-semibold text-text-primary tabular-nums shrink-0">
                      {greatSeller.distinctReviewerCount}/{greatSeller.distinctReviewerTarget}
                    </span>
                  </div>
                  <div className="h-1 bg-background-tertiary rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${greatSeller.reviewersMet ? 'bg-status-success' : 'bg-primary'}`}
                      style={{ width: `${revPct}%` }}
                    />
                  </div>
                </div>

                {/* Puan */}
                <div className="rounded border border-border bg-background-secondary px-2.5 py-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-1 text-[11px]">
                    <span className="text-text-muted truncate">{t("rating", "Puan")}</span>
                    <span className="font-semibold text-text-primary tabular-nums shrink-0">
                      {(avg ?? 0).toFixed(1)}/{minRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1 bg-background-tertiary rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${greatSeller.ratingMet ? 'bg-status-success' : 'bg-primary'}`}
                      style={{ width: `${ratingPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </PageContainer>
    </div>
  );
};

export default UserProfileHeader;