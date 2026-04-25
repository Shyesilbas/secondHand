import {useNavigate} from 'react-router-dom';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import {FollowButton, FollowStats} from '../../follow/index.js';
import {formatDate} from '../../common/formatters.js';
import {ArrowLeft, Star, Calendar, MessageCircle, Flag, UserPlus} from 'lucide-react';

const UserProfileHeader = ({user, isOwnProfile, reviewStats}) => {
  const navigate = useNavigate();
  const name = user?.name || '';
  const surname = user?.surname || '';
  const userInitials = `${name?.[0]?.toUpperCase() || ''}${surname?.[0]?.toUpperCase() || ''}`;
  const memberSince = formatDate(user?.accountCreationDate);
  const hasReviews = reviewStats && reviewStats.totalReviews > 0;

  return (
    <div className="bg-white border-b border-gray-200/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <div className="pt-5">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Profile Row */}
        <div className="py-8 flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-xl shadow-gray-900/10">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {userInitials}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {name} {surname}
              </h1>
              {isOwnProfile && (
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-full uppercase tracking-wider">You</span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
              {hasReviews && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-800 tabular-nums">
                    {(reviewStats.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-amber-600">
                    ({reviewStats.totalReviews})
                  </span>
                </div>
              )}
              <FollowStats userId={user.id} showIcon={true} className="text-gray-500" />
              {memberSince && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                  <Calendar className="w-3 h-3" />
                  Member since {memberSince}
                </span>
              )}
            </div>

            {/* Action buttons */}
            {!isOwnProfile && (
              <div className="flex flex-wrap items-center gap-2.5 mt-4">
                <FollowButton userId={user.id} size="md" />
                <ContactSellerButton
                  listing={{
                    id: `user-chat-${user.id}`,
                    title: `Chat with ${name} ${surname}`,
                    sellerId: user.id,
                    sellerName: name,
                    sellerSurname: surname,
                  }}
                  isDirectChat={true}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200"
                />
                <ComplaintButton
                  targetUserId={user.id}
                  targetUserName={`${name} ${surname}`}
                  targetUser={user}
                  className="inline-flex items-center gap-1.5 px-3 py-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-all duration-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
