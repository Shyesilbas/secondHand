import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { AlertTriangle, Mail, Calendar, CheckCircle2 } from 'lucide-react';
const ProfileHeader = ({
 user
}) => {
 const {
 t
 } = useTranslation();
 const navigate = useNavigate();
 const name = user?.name || '';
 const surname = user?.surname || '';
 const fullName = `${name} ${surname}`.trim();
 const userInitials = (name?.[0] || user?.email?.[0] || 'U').toUpperCase() + (surname?.[0] || '').toUpperCase();
 const isVerified = user?.accountVerified;
 return <>
 <div className="flex items-center gap-5">
 {/* Avatar */}
 <div className="relative">
 <div className="w-16 h-16 rounded-md bg-primary-hover flex items-center justify-center">
 <span className="text-xl font-semibold text-white tracking-tight">
 {userInitials}
 </span>
 </div>
 {isVerified && <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background-secondary border-2 border-white flex items-center justify-center">
 <CheckCircle2 className="h-4 w-4 text-status-success" strokeWidth={1.5} aria-label="Verified" />
 </div>}
 </div>

 {/* Info */}
 <div className="flex-1 min-w-0">
 <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
 {fullName || 'Profile Settings'}
 </h1>
 <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-muted">
 {user?.email && <span className="inline-flex items-center gap-1.5">
 <Mail className="w-3.5 h-3.5 text-text-muted" />
 {user.email}
 </span>}
 {user?.accountCreationDate && <span className="inline-flex items-center gap-1.5">
 <Calendar className="w-3.5 h-3.5 text-text-muted" />{t("member_since")}{new Date(user.accountCreationDate).getFullYear()}
 </span>}
 </div>
 </div>
 </div>

 {/* Verification banner */}
 {!isVerified && <div className="mt-6 flex items-center gap-4 px-5 py-4 rounded bg-background-secondary border border-border/80">
 <AlertTriangle className="shrink-0 h-5 w-5 text-status-warning" strokeWidth={1.5} aria-hidden />
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-status-warning-text">{t("account_verification_required")}</p>
 <p className="text-xs text-status-warning-text mt-0.5">{t("verify_your_email_to_access_all_features")}</p>
 </div>
 <button onClick={() => navigate(ROUTES.VERIFY_ACCOUNT)} className="shrink-0 px-4 py-2 text-sm font-semibold text-status-warning-text bg-background-secondary hover:bg-background-secondary rounded transition-colors duration-200">{t("verify")}</button>
 </div>}
 </>;
};
export default ProfileHeader;