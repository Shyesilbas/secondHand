import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import { FollowButton, FollowStats } from '../../follow/index.js';
import { formatDate } from '../../common/formatters.js';
import { ArrowLeft, Award, Calendar, MessageCircle, ShieldCheck, Star, UserRound } from 'lucide-react';
const UserProfileHeader = ({
  user,
  isOwnProfile,
  reviewStats,
  greatSellerEligible
}) => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const name = user?.name || '';
  const surname = user?.surname || '';
  const userInitials = `${name?.[0]?.toUpperCase() || ''}${surname?.[0]?.toUpperCase() || ''}`;
  const memberSince = formatDate(user?.accountCreationDate);
  const hasReviews = reviewStats && reviewStats.totalReviews > 0;
  const fullName = `${name} ${surname}`.trim() || 'Marketplace member';
  return <div className="relative overflow-hidden bg-[#f8faf8] border-b border-border-light/80">
      <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(135deg,#111827_0%,#1f2937_46%,#365314_100%)]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="pt-5">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200">
            <ArrowLeft className="w-4 h-4" />{t("back")}</button>
        </div>

        {/* Profile Row */}
        <div className="pt-7 pb-6">
          <div className="rounded-2xl border border-white/70 bg-background-primary shadow-xl shadow-gray-900/10">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              <div className="flex flex-1 flex-col sm:flex-row items-start gap-5 p-5 sm:p-6 lg:p-7">
          {/* Avatar */}
                <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-lime-900 flex items-center justify-center shadow-xl shadow-gray-900/15 ring-4 ring-white">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {userInitials}
              </span>
            </div>
                  {greatSellerEligible && <span className="absolute -right-2 -bottom-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-status-warning-bg text-amber-950 shadow-lg ring-4 ring-white">
                      <Award className="h-[18px] w-[18px]" />
                    </span>}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
                {fullName}
              </h1>
              {greatSellerEligible && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-status-warning-bg text-amber-900 border border-amber-200 text-caption font-bold rounded-full uppercase tracking-wide">
                  <Award className="w-3.5 h-3.5" />{t("great_seller")}</span>}
              {isOwnProfile && <span className="px-2.5 py-1 bg-background-secondary text-text-secondary text-caption font-semibold rounded-full uppercase tracking-wider">{t("you")}</span>}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-sm text-text-muted mb-4">
              {hasReviews && <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-status-warning-bg border border-amber-100">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-800 tabular-nums">
                    {(reviewStats.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-status-warning">
                    ({reviewStats.totalReviews})
                  </span>
                </div>}
              <div className="inline-flex items-center rounded-xl border border-border-light bg-background-secondary px-3 py-1.5">
                <FollowStats userId={user.id} showIcon={true} className="text-text-secondary" />
              </div>
              {memberSince && <span className="inline-flex items-center gap-1.5 rounded-xl border border-border-light bg-background-secondary px-3 py-1.5 text-xs font-medium text-text-secondary">
                  <Calendar className="w-3.5 h-3.5" />{t("member_since")}{memberSince}
                </span>}
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-semibold text-text-secondary">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-success-bg px-3 py-1 text-emerald-700 ring-1 ring-emerald-100">
                <ShieldCheck className="h-3.5 w-3.5" />{t("verified_marketplace_profile")}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background-secondary px-3 py-1 text-text-secondary ring-1 ring-gray-200">
                <UserRound className="h-3.5 w-3.5" />{t("seller_profile")}</span>
            </div>

            {/* Action buttons */}
            {!isOwnProfile && <div className="flex flex-wrap items-center gap-2.5 mt-4">
                <FollowButton userId={user.id} size="md" />
                <ContactSellerButton listing={{
                    id: `user-chat-${user.id}`,
                    title: `Chat with ${name} ${surname}`,
                    sellerId: user.id,
                    sellerName: name,
                    sellerSurname: surname
                  }} isDirectChat={true} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200" />
                <ComplaintButton targetUserId={user.id} targetUserName={`${name} ${surname}`} targetUser={user} className="inline-flex items-center gap-1.5 px-3 py-2.5 text-text-muted hover:text-status-error hover:bg-status-error-bg rounded-xl text-sm font-medium transition-all duration-200" />
              </div>}
          </div>
              </div>

              <div className="grid grid-cols-2 gap-px border-t border-border-light bg-border-light lg:w-72 lg:grid-cols-1 lg:border-l lg:border-t-0">
                <div className="bg-background-secondary p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                    <Star className="h-3.5 w-3.5 text-amber-500" />{t("rating")}</div>
                  <p className="mt-2 text-2xl font-bold text-gray-950">
                    {hasReviews ? (reviewStats.averageRating || 0).toFixed(1) : '-'}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-text-muted">
                    {hasReviews ? `${reviewStats.totalReviews} reviews` : 'No reviews yet'}
                  </p>
                </div>
                <div className="bg-background-secondary p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-muted">
                    <MessageCircle className="h-3.5 w-3.5 text-text-secondary" />{t("response")}</div>
                  <p className="mt-2 text-2xl font-bold text-gray-950">{t("open")}</p>
                  <p className="mt-0.5 text-xs font-medium text-text-muted">
                    {isOwnProfile ? 'This is your public page' : 'Message seller directly'}
                  </p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
    </div>;
};
export default UserProfileHeader;