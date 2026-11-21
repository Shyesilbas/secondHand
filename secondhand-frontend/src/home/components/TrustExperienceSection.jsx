import { useTranslation } from "react-i18next";
import HomeSection from './HomeSection.jsx';
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

  // Static feature descriptions: white cards at rest, no hover state because they are not links.
  return (
    <HomeSection
      title={t("real_product_capabilities_ensuring_safe_")}
      description={t("we_prioritize_real_working_technology_ov")}
    >
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {TRUST_FEATURES.map((feat) => {
          const Icon = feat.icon;
          return (
            <li key={feat.id} className="flex flex-col rounded border border-border-light bg-background-primary p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-background-secondary text-text-secondary">
                  <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="rounded-sm bg-background-secondary px-2 py-0.5 text-xs font-medium text-text-secondary">
                  {t(feat.badgeKey, feat.badge)}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-text-primary">{t(feat.titleKey, feat.title)}</h3>
              <p className="mt-2 text-sm text-text-secondary">{t(feat.descKey, feat.desc)}</p>
            </li>
          );
        })}
      </ul>
    </HomeSection>
  );
};

export default TrustExperienceSection;
