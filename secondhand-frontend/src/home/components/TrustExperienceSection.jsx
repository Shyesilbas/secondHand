import { useTranslation } from "react-i18next";
import React from 'react';
import { ShieldAlert, QrCode, Wallet, MessageSquare, Star, CheckCircle } from 'lucide-react';
const TRUST_FEATURES = [{
  title: 'Safe Meetup Verification',
  desc: 'Perform in-person handovers securely. Trades are confirmed instantly using a unique transaction QR code or verification PIN code directly verified by the system.',
  icon: QrCode,
  badge: 'Real-Time Verification'
}, {
  title: 'Secure Wallet Balances',
  desc: 'Keep funds safe in your platform E-Wallet. Fully manage secure deposits, withdrawals, and set automatic spending warning alerts to keep your budget protected.',
  icon: Wallet,
  badge: 'E-Wallet System'
}, {
  title: 'Instant Negotiating Chat',
  desc: 'Connect with buyers and sellers immediately. Use private, real-time messaging rooms directly linked to listings to make offers, ask questions, and arrange trades.',
  icon: MessageSquare,
  badge: 'Direct Messaging'
}, {
  title: 'Reputation & Ratings',
  desc: 'Trade with confidence. Review transparent star ratings and genuine feedback metrics from completed transactions to inspect seller track records.',
  icon: Star,
  badge: 'Double-Sided Reviews'
}, {
  title: 'Doğrulanmış Profiller',
  desc: 'User identity is confirmed before posting listings. Every great seller badge represents confirmed contact paths and real account validation logs.',
  icon: CheckCircle,
  badge: 'Account Verification'
}];
const TrustExperienceSection = () => {
  const {
    t
  } = useTranslation();
  return <section className="py-16 bg-background-primary border-t border-border-light">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-caption font-bold uppercase tracking-[0.2em] text-status-success mb-2">{t("built_in_protection")}</p>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("real_product_capabilities_ensuring_safe_")}</h2>
          <p className="text-text-secondary text-sm mt-3 leading-relaxed font-medium">{t("we_prioritize_real_working_technology_ov")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_FEATURES.map(feat => {
          const Icon = feat.icon;
          return <div key={feat.title} className="group border border-border-light rounded-xl p-6 bg-background-secondary transition-all duration-200 hover:bg-background-primary hover:border-border hover:shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-md bg-background-tertiary text-text-secondary flex items-center justify-center transition-colors group-hover:bg-status-success-bg group-hover:text-status-success">
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <span className="text-caption font-bold uppercase tracking-wider text-text-secondary bg-secondary-light px-2 py-0.5 rounded-md border border-border-light">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-text-primary tracking-tight mt-4 group- transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-body text-text-secondary leading-relaxed mt-2.5 font-medium">
                    {feat.desc}
                  </p>
                </div>
              </div>;
        })}
        </div>
      </div>
    </section>;
};
export default TrustExperienceSection;