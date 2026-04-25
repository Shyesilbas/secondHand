import {CheckCircle2, XCircle, Clock} from 'lucide-react';
import {USER_ACCOUNT_STATUSES, USER_DEFAULTS} from '../userConstants.js';

const statusConfig = {
  [USER_ACCOUNT_STATUSES.ACTIVE]: {
    label: 'Active',
    icon: CheckCircle2,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Your account is active and in good standing.',
  },
  [USER_ACCOUNT_STATUSES.SUSPENDED]: {
    label: 'Suspended',
    icon: XCircle,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    dot: 'bg-red-500',
    description: 'Your account has been suspended. Contact support for assistance.',
  },
  [USER_ACCOUNT_STATUSES.PENDING]: {
    label: 'Pending',
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    description: 'Your account is pending review.',
  },
};

const fallbackStatus = {
  label: 'Unknown',
  icon: Clock,
  color: 'text-gray-700',
  bg: 'bg-gray-50',
  border: 'border-gray-200',
  dot: 'bg-gray-400',
  description: 'Account status is unknown.',
};

const ProfileAccountStatus = ({user}) => {
  const accountStatus = user?.accountStatus || USER_DEFAULTS.UNKNOWN_STATUS;
  const config = statusConfig[accountStatus] || fallbackStatus;
  const StatusIcon = config.icon;
  const isVerified = user?.accountVerified;

  return (
    <div className="space-y-4">
      {/* Account Status Card */}
      <div className={`flex items-start gap-4 p-5 rounded-xl border ${config.border} ${config.bg}`}>
        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <StatusIcon className={`w-5 h-5 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
            <span className={`w-2 h-2 rounded-full ${config.dot}`} />
          </div>
          <p className={`text-sm ${config.color} opacity-80`}>{config.description}</p>
        </div>
      </div>

      {/* Email Verification Card */}
      <div className={`flex items-start gap-4 p-5 rounded-xl border ${
        isVerified ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isVerified ? 'bg-emerald-100' : 'bg-red-100'
        }`}>
          {isVerified
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            : <XCircle className="w-5 h-5 text-red-600" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-bold ${isVerified ? 'text-emerald-700' : 'text-red-700'}`}>
              {isVerified ? 'Email Verified' : 'Email Not Verified'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isVerified ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>
          <p className={`text-sm ${isVerified ? 'text-emerald-600' : 'text-red-600'} opacity-80`}>
            {isVerified
              ? 'Your email address has been verified successfully.'
              : 'Please verify your email address to access all features.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccountStatus;
