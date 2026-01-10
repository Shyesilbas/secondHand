import React from 'react';
import { useNavigate } from 'react-router-dom';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ComplaintButton from '../../complaint/components/ComplaintButton.jsx';
import { FollowButton, FollowStats } from '../../follow/index.js';

const UserProfileHeader = ({ 
  user, 
  isOwnProfile, 
  reviewStats 
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
        <button
          onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-3"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0]?.toUpperCase()}{user.surname?.[0]?.toUpperCase()}
            </div>
            <div>
        <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name} {user.surname}
          </h1>
                {isOwnProfile && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">You</span>
                )}
          {reviewStats && reviewStats.totalReviews > 0 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-yellow-50 border border-yellow-200 rounded-full">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-yellow-800">
                {(reviewStats.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-sm text-yellow-700">
                ({reviewStats.totalReviews})
              </span>
            </div>
          )}
        </div>
              
              <div className="mt-2">
                <FollowStats userId={user.id} showIcon={true} className="text-gray-600" />
              </div>
              
              <p className="text-sm text-gray-500 mt-1">
                {user.accountCreationDate && `Member since ${new Date(user.accountCreationDate).getFullYear()}`}
        </p>
            </div>
          </div>
      </div>

      {!isOwnProfile && (
          <div className="flex items-center gap-3">
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
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          />
          <ComplaintButton
            targetUserId={user.id}
            targetUserName={`${user.name} ${user.surname}`}
            targetUser={user}
              className="px-4 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default UserProfileHeader;
