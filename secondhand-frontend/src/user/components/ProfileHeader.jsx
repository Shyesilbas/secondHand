import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import {AlertTriangle, Mail, Calendar, CheckCircle2} from 'lucide-react';

const ProfileHeader = ({user}) => {
  const navigate = useNavigate();
  const name = user?.name || '';
  const surname = user?.surname || '';
  const fullName = `${name} ${surname}`.trim();
  const userInitials = (name?.[0] || user?.email?.[0] || 'U').toUpperCase() + (surname?.[0] || '').toUpperCase();
  const isVerified = user?.accountVerified;

  return (
    <>
      <div className="flex items-center gap-5">
        {/* Avatar */}
        <div className="relative">
          <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg shadow-gray-900/10">
            <span className="text-xl font-bold text-white tracking-tight">
              {userInitials}
            </span>
          </div>
          {isVerified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {fullName || 'Profile Settings'}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
            {user?.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {user.email}
              </span>
            )}
            {user?.accountCreationDate && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                Member since {new Date(user.accountCreationDate).getFullYear()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification banner */}
      {!isVerified && (
        <div className="mt-6 flex items-center gap-4 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200/80">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Account verification required</p>
            <p className="text-xs text-amber-700 mt-0.5">Verify your email to access all features.</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)}
            className="shrink-0 px-4 py-2 text-sm font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors duration-200"
          >
            Verify
          </button>
        </div>
      )}
    </>
  );
};

export default ProfileHeader;
