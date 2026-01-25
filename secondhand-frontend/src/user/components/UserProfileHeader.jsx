import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import { FollowButton, FollowStats } from '../../follow/index.js';
import { formatDate } from '../../common/formatters.js';

const UserProfileHeader = ({ 
  user, 
  isOwnProfile, 
  reviewStats 
}) => {
  const navigate = useNavigate();

  const userInitials = `${user.name?.[0]?.toUpperCase() || ''}${user.surname?.[0]?.toUpperCase() || ''}`;

  const memberSince = formatDate(user?.accountCreationDate);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm mb-8">
      <div className="p-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center ring-4 ring-white shadow-lg">
              <span className="text-3xl font-bold text-indigo-700 tracking-tight">
                {userInitials}
              </span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tighter">
                {user.name} {user.surname}
              </h1>
              {isOwnProfile && (
                <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full tracking-tight">You</span>
              )}
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
                  <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-800 tracking-tight">
                    {(reviewStats.averageRating || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-amber-700 tracking-tight">
                    ({reviewStats.totalReviews})
                  </span>
                </div>
              )}
            </div>
            
            <div className="mb-3">
              <FollowStats userId={user.id} showIcon={true} className="text-slate-600" />
            </div>
            
            <p className="text-sm text-slate-500 tracking-tight">
              {memberSince && `Member since ${memberSince}`}
            </p>
          </div>
        </div>

        {!isOwnProfile && (
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
            <FollowButton userId={user.id} size="md" />
            <ContactSellerButton
              listing={{
                id: `user-chat-${user.id}`,
                title: `Chat with ${user.name} ${user.surname}`,
                sellerId: user.id,
                sellerName: user.name,
                sellerSurname: user.surname
              }}
              isDirectChat={true}
              className="px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md tracking-tight"
            />
            <ComplaintButton
              targetUserId={user.id}
              targetUserName={`${user.name} ${user.surname}`}
              targetUser={user}
              className="px-5 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md tracking-tight"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;
