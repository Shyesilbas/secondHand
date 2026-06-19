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
  return <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2">{t("built_in_protection")}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">{t("real_product_capabilities_ensuring_safe_")}</h2>
          <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">{t("we_prioritize_real_working_technology_ov")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_FEATURES.map(feat => {
          const Icon = feat.icon;
          return <div key={feat.title} className="group border border-slate-100 rounded-2xl p-6 bg-slate-50/30 transition-all duration-200 hover:bg-white hover:border-slate-200/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100/50 px-2 py-0.5 rounded border border-slate-100">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 tracking-tight mt-4 group-hover:text-emerald-600 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed mt-2.5 font-medium">
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