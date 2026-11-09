import { useTranslation } from "react-i18next";
import { QrCode, Wallet, MessageSquare, Star, CheckCircle } from 'lucide-react';

const TRUST_FEATURES = [
  {
    id: 'meetup',
    icon: QrCode,
    titleKey: 'trust_feat_meetup_title',
    descKey: 'trust_feat_meetup_desc',
    badgeKey: 'trust_feat_meetup_badge',
    title: 'Safe Meetup Verification',
    desc: 'Perform in-person handovers securely. Trades are confirmed instantly using a unique transaction QR code or verification PIN code directly verified by the system.',
    badge: 'Real-Time Verification'
  },
  {
    id: 'wallet',
    icon: Wallet,
    titleKey: 'trust_feat_wallet_title',
    descKey: 'trust_feat_wallet_desc',
    badgeKey: 'trust_feat_wallet_badge',
    title: 'Secure Wallet Balances',
    desc: 'Keep funds safe in your platform E-Wallet. Fully manage secure deposits, withdrawals, and set automatic spending warning alerts to keep your budget protected.',
    badge: 'E-Wallet System'
  },
  {
    id: 'chat',
    icon: MessageSquare,
    titleKey: 'trust_feat_chat_title',
    descKey: 'trust_feat_chat_desc',
    badgeKey: 'trust_feat_chat_badge',
    title: 'Instant Negotiating Chat',
    desc: 'Connect with buyers and sellers immediately. Use private, real-time messaging rooms directly linked to listings to make offers, ask questions, and arrange trades.',
    badge: 'Direct Messaging'
  },
  {
    id: 'reviews',
    icon: Star,
    titleKey: 'trust_feat_reviews_title',
    descKey: 'trust_feat_reviews_desc',
    badgeKey: 'trust_feat_reviews_badge',
    title: 'Reputation & Ratings',
    desc: 'Trade with confidence. Review transparent star ratings and genuine feedback metrics from completed transactions to inspect seller track records.',
    badge: 'Double-Sided Reviews'
  },
  {
    id: 'verified',
    icon: CheckCircle,
    titleKey: 'trust_feat_verified_title',
    descKey: 'trust_feat_verified_desc',
    badgeKey: 'trust_feat_verified_badge',
    title: 'Verified Profiles',
    desc: 'User identity is confirmed before posting listings. Every great seller badge represents confirmed contact paths and real account validation logs.',
    badge: 'Account Verification'
  }
];

const TrustExperienceSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-background-primary border-t border-border-light">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-status-success mb-2">{t("built_in_protection")}</p>
          <h2 className="text-lg font-semibold text-text-primary tracking-tight">{t("real_product_capabilities_ensuring_safe_")}</h2>
          <p className="text-text-secondary text-sm mt-3 leading-relaxed font-medium">{t("we_prioritize_real_working_technology_ov")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TRUST_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.id} className="group border border-border-light rounded p-6 bg-background-secondary transition-all duration-200 hover:bg-background-primary hover:border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <Icon className="h-5 w-5 shrink-0 text-text-secondary group-hover:text-status-success-text" strokeWidth={1.5} aria-hidden />
                    <span className="text-xs font-semibold text-text-secondary bg-secondary-light px-2 py-0.5 rounded-md border border-border-light">
                      {t(feat.badgeKey, feat.badge)}
                    </span>
                  </div>

                  <h3 className="text-sm font-medium text-text-primary tracking-tight mt-4 group-hover:text-text-primary transition-colors">
                    {t(feat.titleKey, feat.title)}
                  </h3>
                  <p className="text-body text-text-secondary leading-relaxed mt-2.5 font-medium">
                    {t(feat.descKey, feat.desc)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustExperienceSection;
