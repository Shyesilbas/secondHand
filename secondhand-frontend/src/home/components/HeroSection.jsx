import { useTranslation } from "react-i18next";
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import { useShowcaseQueries } from '../../showcase/hooks/queries.js';
import HeroListingCard from './HeroListingCard.jsx';
import { ArrowRight, BadgeCheck, CreditCard, MessageSquare, Search, ShieldCheck, Sparkles } from 'lucide-react';
const HeroSection = () => {
 const {
 t
 } = useTranslation();
 const {
 showcases
 } = useShowcaseQueries({
 enabled: true,
 page: 0,
 size: 24
 });

 // Extract actual listings: 1 Vehicle, 1 Electronic, 1 Real Estate
 const featuredCards = useMemo(() => {
 if (!Array.isArray(showcases) || showcases.length === 0) return [];
 const vehicle = showcases.find(s => s.listing?.type === 'VEHICLE')?.listing;
 const electronic = showcases.find(s => s.listing?.type === 'ELECTRONICS')?.listing;
 const realEstate = showcases.find(s => s.listing?.type === 'REAL_ESTATE')?.listing;
 const cards = [];
 if (vehicle) cards.push(vehicle);
 if (electronic) cards.push(electronic);
 if (realEstate) cards.push(realEstate);

 // Fallback if we don't have exactly one of each, grab the first 3 featured listings
 if (cards.length < 3) {
 const existingIds = new Set(cards.map(c => c.id));
 showcases.forEach(s => {
 if (cards.length < 3 && s.listing && !existingIds.has(s.listing.id)) {
 cards.push(s.listing);
 }
 });
 }
 return cards;
 }, [showcases]);
 return <section className="relative overflow-hidden bg-background-primary border-b border-border/80 text-text-primary">
 {/* Decorative Light Background Glowing Accents */}

 <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
 <div className="grid lg:grid-cols-[minmax(0,1fr)_540px] lg:items-center gap-10 lg:gap-12">
 <div className="max-w-2xl">
 <div className="flex flex-wrap items-center gap-2.5 mb-6">
 <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-background-tertiary border border-card-border-hover text-xs font-semibold text-text-primary">
 <Sparkles className="w-3.5 h-3.5 text-text-primary" />{t("curated_marketplace")}</span>
 <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-white border border-border text-xs font-semibold text-text-secondary">
 <BadgeCheck className="w-3.5 h-3.5 text-text-primary" />{t("verified_trade")}</span>
 </div>

 <h1 className="text-3xl font-semibold text-text-primary sm:text-4xl lg:text-5xl tracking-tight leading-tight">
 {t("find_better_deals_from_sellers_you_can_t")}
 </h1>
 <p className="mt-5 text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl font-medium">
 {t("browse_vetted_listings_compare_real_pric")}
 </p>

 <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
 <Link to={ROUTES.LISTINGS_PREFILTER} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-10 px-4 group min-w-0 flex-1">
 <Search className="w-5 h-5 text-text-primary shrink-0" />
 <span className="truncate">{t("search_cars_phones_homes_fashion")}</span>
 <ArrowRight className="ml-auto w-4 h-4 text-text-primary transition-transform shrink-0" />
 </Link>
 <Link to={ROUTES.LISTINGS_PREFILTER_CREATE} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 shrink-0">
 + {t("start_selling")}
 </Link>
 </div>

 <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl">
 {[{
 icon: ShieldCheck,
 title: 'Verified Sellers',
 text: 'Escrow protected deals'
 }, {
 icon: CreditCard,
 title: 'Wallet Checkout',
 text: 'Zero commission hold'
 }, {
 icon: MessageSquare,
 title: 'Direct Chat',
 text: 'Instant offer feature'
 }].map((item) => {
 const Icon = item.icon;
 return <div key={item.title} className="flex items-center gap-3 rounded-md border border-border/80 bg-white p-3.5 hover:border-card-border-hover transition-all">
 <Icon className="shrink-0 h-5 w-5 text-text-primary" strokeWidth={1.5} aria-hidden />
 <div className="min-w-0">
 <p className="text-xs font-semibold text-text-primary truncate">{item.title}</p>
 <p className="text-xs font-medium text-text-tertiary truncate">{item.text}</p>
 </div>
 </div>;
 })}
 </div>
 </div>

 <div className="relative flex items-center justify-center min-h-80 lg:h-[440px]">
 <div className="absolute inset-x-2 bottom-2 top-8 rounded-md bg-primary border border-primary-hover shadow-md" />
 
 <div className="absolute left-6 top-4 rounded-md border border-secondary-700/30 bg-primary/90 px-4 py-2.5 shadow-md z-30">
 <p className="text-xs font-semibold text-text-secondary">{t("live_picks")}</p>
 <p className="mt-0.5 text-xl font-semibold text-white">{featuredCards.length || 3} İlan</p>
 </div>
 
 <div className="absolute right-6 bottom-6 rounded-md border border-secondary-700/30 bg-primary/90 px-4 py-2.5 shadow-md z-30">
 <p className="text-xs font-semibold text-text-secondary">{t("safer_deals")}</p>
 <p className="mt-0.5 text-xs font-semibold text-secondary-200">{t("chat_checkout")}</p>
 </div>

 <div className="relative flex items-center justify-center w-full h-80 lg:h-96">
 {featuredCards.length > 0 ? featuredCards.map((listing, index) => {
 const rotations = [-5, 4, -1];
 const translationsX = [-70, 56, 0];
 const translationsY = [-24, 18, 62];
 const style = {
 position: 'absolute',
 transform: `rotate(${rotations[index % 3]}deg) translate(${translationsX[index % 3]}px, ${translationsY[index % 3]}px)`,
 zIndex: 10 + index
 };
 return <HeroListingCard key={listing.id} listing={listing} style={style} className="scale-75 sm:scale-90 lg:scale-100" />;
 }) : <div className="w-80 h-52 rounded-md bg-primary/80 border border-primary-hover flex items-center justify-center p-6 shadow-md">
 <div className="text-text-muted text-xs font-semibold tracking-wide animate-pulse">{t("loading_showcase")}</div>
 </div>}
 </div>
 </div>
 </div>
 </div>
 </section>;
};
export default HeroSection;