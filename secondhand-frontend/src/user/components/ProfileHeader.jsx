import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';

const ProfileHeader = ({ user }) => {
  const navigate = useNavigate();
  const userInitials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center ring-4 ring-white shadow-lg">
            <span className="text-2xl font-bold text-indigo-700 tracking-tight">
              {userInitials}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tighter mb-2">
            {user?.name && user?.surname ? `${user.name} ${user.surname}` : 'Profile Settings'}
          </h1>
          <p className="text-slate-500 tracking-tight">
            {user?.email || 'Manage your account information and preferences'}
          </p>
        </div>
      </div>

      {!user?.accountVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mr-4">
              <svg
                className="w-5 h-5 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800 tracking-tight mb-1">
                Account verification required
              </h3>
              <p className="text-sm text-amber-700 tracking-tight mb-4">
                Please verify your email address to access all features and improve account security.
              </p>
              <button
                onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md tracking-tight"
              >
                Verify Account
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileHeader;
