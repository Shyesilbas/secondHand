import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import { FollowButton, FollowStats } from '../../follow/index.js';
import { formatDate } from '../../common/formatters.js';
import { buttonClasses } from '../../common/components/ui/Button.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { Award, Plus, Settings, ShieldCheck, Star } from 'lucide-react';

const Stat = ({ label, children }) => (
 <div className="min-w-0 px-4 py-3 first:pl-0 sm:px-5">
 <p className="truncate text-sm text-text-tertiary">{label}</p>
 <div className="mt-0.5 truncate text-base font-semibold tabular-nums text-text-primary">{children}</div>
 </div>
);

const ProgressRow = ({ label, value, met, pct, hint }) => (
 <div className="min-w-0" title={hint}>
 <div className="flex items-baseline justify-between gap-2 text-sm">
 <span className="truncate text-text-secondary">{label}</span>
 <span className="shrink-0 tabular-nums text-text-primary">{value}</span>
 </div>
 <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background-tertiary">
 <div className={`h-full rounded-full ${met ? 'bg-status-success' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
 </div>
 </div>
);

// Owner-only progress towards the "Great seller" badge.
const GreatSellerProgress = ({ greatSeller }) => {
 const { t } = useTranslation();
 const pct = (value, target) => Math.min(100, ((value || 0) / (target || 1)) * 100);
 const minRating = greatSeller.minimumAverageRating ?? 4.7;
 const avg = greatSeller.averageRating ?? 0;
 const minTry = Number(greatSeller.minUnitPriceThreshold ?? 1500);
 return (
 <div className="mt-5 border-t border-border-light pt-5">
 <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
 <p className="inline-flex items-center gap-2 text-sm font-medium text-text-primary">
 <Award className="h-4 w-4 text-status-warning" strokeWidth={1.5} aria-hidden />
 {t('great_seller_milestones', 'Harika satıcı kriterleri')}
 </p>
 <p className="text-sm text-text-tertiary">
 {greatSeller.eligible
 ? t('great_seller_earned', 'Rozet kazanıldı')
 : t('great_seller_window', { defaultValue: 'Son {{days}} gün', days: greatSeller.rollingWindowDays ?? 60 })}
 </p>
 </div>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
 <ProgressRow
 label={t('sales', 'Satış')}
 value={`${greatSeller.qualifyingSalesLastWindow ?? 0}/${greatSeller.qualifyingSalesTarget ?? 0}`}
 met={greatSeller.salesMet}
 pct={pct(greatSeller.qualifyingSalesLastWindow, greatSeller.qualifyingSalesTarget)}
 hint={t('great_seller_sales_hint', { defaultValue: 'Birim fiyatı en az {{amount}} TL olan satışlar', amount: minTry.toLocaleString('tr-TR') })}
 />
 <ProgressRow
 label={t('distinct_reviewers', 'Farklı değerlendiren')}
 value={`${greatSeller.distinctReviewerCount ?? 0}/${greatSeller.distinctReviewerTarget ?? 0}`}
 met={greatSeller.reviewersMet}
 pct={pct(greatSeller.distinctReviewerCount, greatSeller.distinctReviewerTarget)}
 />
 <ProgressRow
 label={t('rating', 'Puan')}
 value={`${avg.toFixed(1)}/${minRating.toFixed(1)}`}
 met={greatSeller.ratingMet}
 pct={greatSeller.ratingMet ? 100 : pct(avg, minRating)}
 />
 </div>
 </div>
 );
};

export const UserProfileHeaderSkeleton = () => (
 <div className="rounded border border-border bg-background-primary p-5 sm:p-6" aria-hidden>
 <div className="flex items-start gap-4">
 <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
 <div className="flex-1 space-y-2.5 pt-1">
 <Skeleton className="h-7 w-56 max-w-full" />
 <Skeleton className="h-4 w-72 max-w-full" />
 </div>
 </div>
 <Skeleton className="mt-5 h-14 w-full" />
 </div>
);

const UserProfileHeader = ({ user, isOwnProfile, reviewStats, greatSeller, activeListingCount }) => {
 const { t } = useTranslation();
 const name = user?.name || '';
 const surname = user?.surname || '';
 const initials = `${name[0] || ''}${surname[0] || ''}`.toUpperCase() || 'U';
 const fullName = `${name} ${surname}`.trim() || t('marketplace_member', 'Pazar yeri üyesi');
 const memberSince = formatDate(user?.accountCreationDate);
 const reviewCount = Number(reviewStats?.totalReviews ?? 0);
 const isGreatSeller = Boolean(greatSeller?.eligible);

 return (
 <section className="rounded border border-border bg-background-primary p-5 sm:p-6" aria-label={fullName}>
 <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
 <div className="flex min-w-0 items-start gap-4">
 <span className="flex h-16 w-16 shrink-0 select-none items-center justify-center rounded-full bg-background-tertiary text-xl font-semibold text-text-primary">
 {initials}
 </span>
 <div className="min-w-0 pt-0.5">
 <div className="flex flex-wrap items-center gap-2">
 <h1 className="truncate text-2xl font-semibold text-text-primary">{fullName}</h1>
 {isOwnProfile && (
 <span className="rounded-sm bg-background-tertiary px-1.5 py-0.5 text-xs font-medium text-text-secondary">{t('you', 'Sen')}</span>
 )}
 </div>
 <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-text-tertiary">
 {isGreatSeller && (
 <span className="inline-flex items-center gap-1 rounded-sm bg-status-warning-bg px-1.5 py-0.5 text-xs font-medium text-status-warning-text">
 <Award className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
 {t('great_seller', 'Harika satıcı')}
 </span>
 )}
 {user?.accountVerified && (
 <span className="inline-flex items-center gap-1 text-text-secondary">
 <ShieldCheck className="h-4 w-4 text-status-success" strokeWidth={1.5} aria-hidden />
 {t('verified_account', 'Doğrulanmış hesap')}
 </span>
 )}
 <FollowStats userId={user.id} showIcon={false} className="text-sm" />
 </div>
 </div>
 </div>

 <div className="flex shrink-0 flex-wrap items-center gap-2">
 {isOwnProfile ? (
 <>
 <Link to={ROUTES.PROFILE} className={buttonClasses('secondary', 'sm')}>
 <Settings className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 {t('account_settings', 'Hesap ayarları')}
 </Link>
 <Link to={ROUTES.CREATE_LISTING} className={buttonClasses('primary', 'sm')}>
 <Plus className="h-4 w-4" strokeWidth={1.5} aria-hidden />
 {t('create_listing', 'İlan oluştur')}
 </Link>
 </>
 ) : (
 <>
 <ContactSellerButton
 listing={{
 id: `user-chat-${user.id}`,
 title: `${t('chat_with', 'Sohbet:')} ${fullName}`,
 sellerId: user.id,
 sellerName: name,
 sellerSurname: surname
 }}
 isDirectChat
 variant="primary"
 label={t('send_message', 'Mesaj gönder')}
 className="h-9 px-3"
 />
 <FollowButton userId={user.id} size="sm" />
 <ComplaintButton targetUserId={user.id} targetUserName={fullName} targetUser={user} variant="ghost" />
 </>
 )}
 </div>
 </div>

 <div className="mt-5 grid grid-cols-3 divide-x divide-border-light border-t border-border-light pt-1">
 <Stat label={t('rating', 'Puan')}>
 {reviewCount > 0 ? (
 <span className="inline-flex items-center gap-1">
 <Star className="h-4 w-4 fill-status-warning text-status-warning" strokeWidth={1.5} aria-hidden />
 {Number(reviewStats.averageRating || 0).toFixed(1)}
 <span className="text-sm font-normal text-text-tertiary">({reviewCount})</span>
 </span>
 ) : (
 <span className="text-sm font-normal text-text-tertiary">{t('no_reviews_yet', 'Henüz yok')}</span>
 )}
 </Stat>
 <Stat label={t('active_listings', 'Yayındaki ilan')}>{activeListingCount ?? '—'}</Stat>
 <Stat label={t('member_since_label', 'Üyelik')}>{memberSince || '—'}</Stat>
 </div>

 {isOwnProfile && greatSeller ? <GreatSellerProgress greatSeller={greatSeller} /> : null}
 </section>
 );
};

export default UserProfileHeader;
