import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
 AlertTriangle,
 ArrowRight,
 ChevronDown,
 ChevronRight,
 Clock,
 Crown,
 ExternalLink,
 Heart,
 HelpCircle,
 Layers,
 MapPin,
 MessageSquare,
 Package,
 Plus,
 RotateCcw,
 ShieldCheck,
 ShoppingBag,
 Sparkles,
 TrendingUp,
 Truck,
 UserCheck,
 Wallet,
 Zap
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { usePlan } from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { ROUTES } from '../../common/constants/routes.js';
import { USER_DEFAULTS } from '../userConstants.js';
import { getAccountHubNavGroups } from '../utils/accountHubSections.js';
import { isAdminUser } from '../../common/utils/admin.js';
import { orderService } from '../../order/services/orderService.js';
import { listingService } from '../../listing/services/listingService.js';
import { formatCurrency, formatDate } from '../../common/formatters.js';
import MyShowcasesPanel from '../../showcase/components/MyShowcasesPanel.jsx';
import { useMyShowcases } from '../../showcase/hooks/useMyShowcases.js';

const getInitials = (name) => {
 const value = (name || '').trim();
 if (!value) return USER_DEFAULTS.FALLBACK_NAME_INITIAL;
 const parts = value.split(/\s+/).filter(Boolean);
 const first = parts[0]?.[0] || USER_DEFAULTS.FALLBACK_NAME_INITIAL;
 const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
 return `${first}${last}`.toUpperCase();
};

const isRouteActive = (pathname, route) => pathname === route;

const AccountHubPage = () => {
 const { t, i18n } = useTranslation();
 const { user } = useAuthState();
 const { pathname } = useLocation();
 const [openGroups, setOpenGroups] = useState(() => new Set(['overview', 'selling', 'buying']));
 const [showUpgrade, setShowUpgrade] = useState(false);

 const navGroups = useMemo(() => {
 const id = user?.id;
 return getAccountHubNavGroups(id ?? 0, {
 isAdmin: isAdminUser(user)
 });
 }, [user]);

 const toggleGroup = (id) => {
 setOpenGroups(prev => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 };

 // Recent orders query
 const {
 data: ordersData,
 isLoading: ordersLoading
 } = useQuery({
 queryKey: ['myOrders', user?.id, 0, 5],
 queryFn: () => orderService.myOrders(0, 5),
 enabled: !!user?.id,
 staleTime: 60 * 1000,
 gcTime: 10 * 60 * 1000,
 refetchOnWindowFocus: false
 });
 const recentOrders = useMemo(() => ordersData?.content || [], [ordersData]);
 const totalOrdersCount = ordersData?.totalElements ?? recentOrders.length;

 // Active listings count query
 const {
 data: myListingsData
 } = useQuery({
 queryKey: ['myListings', user?.id, 0, 1, 'ACTIVE'],
 queryFn: () => listingService.getMyListings(0, 1, null, null, 'ACTIVE'),
 enabled: !!user?.id,
 staleTime: 60 * 1000,
 gcTime: 10 * 60 * 1000,
 refetchOnWindowFocus: false
 });
 const activeListingsCount = myListingsData?.totalElements ?? 0;

 // In-transit / active orders count
 const inTransitOrdersCount = useMemo(() => {
 return recentOrders.filter(o => 
 o.status === 'SHIPPED' || 
 o.status === 'PROCESSING' || 
 o.status === 'MEETUP_PENDING' ||
 o.status === 'IN_TRANSIT'
 ).length;
 }, [recentOrders]);

 const {
 plan,
 isPremium,
 purchaseDate,
 expirationDate,
 dailyAuraUsage,
 dailyAuraLimit,
 maxShowcaseSlots,
 estimatedShippingDays,
 autoRenew,
 cancelSubscription,
 isCancelling,
 toggleAutoRenew,
 isTogglingAutoRenew,
 orderProcessingSpeed,
 premiumMaxShowcaseSlots,
 premiumDailyAuraLimit,
 premiumEstimatedShippingDays,
 premiumOrderProcessingSpeed
 } = usePlan();

 const { showcases } = useMyShowcases(user?.id);
 const activeShowcasesCount = useMemo(() => 
 showcases ? showcases.filter(s => new Date(s.endDate) > new Date()).length : 0, 
 [showcases]
 );

 const isExpiringSoon = useMemo(() => {
 if (!isPremium || !expirationDate) return false;
 const diff = new Date(expirationDate) - new Date();
 const days = diff / (1000 * 60 * 60 * 24);
 return days > 0 && days <= 3;
 }, [isPremium, expirationDate]);

 const handleCancelSubscription = () => {
 if (window.confirm(t('confirm_cancel_subscription', 'Aboneliğinizi iptal etmek istediğinize emin misiniz? Gelecek dönem için otomatik yenileme kapatılacaktır.'))) {
 cancelSubscription();
 }
 };

 if (!user) {
 return (
 <div className="min-h-[70vh] flex flex-col items-center justify-center">
 <div className="relative flex items-center justify-center">
 <div className="w-12 h-12 rounded-full border-2 border-slate-900/20 border-t-slate-900 animate-spin" />
 <Sparkles className="w-5 h-5 text-slate-900 absolute" />
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-slate-50/50 flex flex-col lg:flex-row font-sans">
 {/* ── Left Sidebar Navigation ── */}
 <aside className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col p-4 sm:p-6 lg:py-8 lg:pl-8 lg:pr-4 select-none">
 {/* User Card Profile Summary */}
 <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs mb-6 transition-all hover:border-slate-300">
 <div className="flex items-center gap-3.5">
 <div className="relative">
 <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-sm shadow-xs overflow-hidden">
 {user?.profilePicture ? (
 <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
 ) : (
 getInitials(`${user?.name || ''} ${user?.surname || ''}`)
 )}
 </div>
 {isPremium && (
 <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs border-2 border-white">
 <Crown className="w-3 h-3 fill-current" />
 </div>
 )}
 </div>
 <div className="overflow-hidden min-w-0 flex-1">
 <div className="flex items-center gap-1.5">
 <h2 className="text-sm font-extrabold text-slate-900 truncate">
 {user?.name ? `${user.name}${user.surname ? ` ${user.surname}` : ''}` : 'User'}
 </h2>
 </div>
 <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">{user?.email || ''}</p>
 <div className="mt-1.5 flex items-center gap-1.5">
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
 isPremium 
 ? 'bg-amber-50 text-amber-800 border border-amber-200/60' 
 : 'bg-slate-100 text-slate-900 border border-slate-300/60'
 }`}>
 <span className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-amber-500' : 'bg-slate-900'}`} />
 {isPremium ? (plan || 'Premium') : t('standard_plan', 'Standart')}
 </span>
 <Link 
 to={ROUTES.PROFILE} 
 className="text-[10px] font-bold text-slate-400 hover:text-slate-900 underline underline-offset-2 transition-colors ml-auto"
 >
 {t('edit', 'Düzenle')}
 </Link>
 </div>
 </div>
 </div>
 </div>

 {/* Mobile Horizontal Navigation Tabs */}
 <nav className="flex lg:hidden overflow-x-auto gap-2 pb-4 scrollbar-none -mx-4 px-4">
 {navGroups.map(group => {
 return group.items.map(item => {
 const active = isRouteActive(pathname, item.route);
 const ItemIcon = item.icon;
 return (
 <Link
 key={`mobile-${group.id}-${item.route}`}
 to={item.route}
 className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
 active
 ? 'bg-slate-900 text-white shadow-xs'
 : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
 }`}
 >
 <ItemIcon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-slate-400'}`} />
 <span>{t(item.nameKey || item.name)}</span>
 </Link>
 );
 });
 })}
 </nav>

 {/* Desktop Navigation Accordion Groups */}
 <nav className="hidden lg:flex flex-col gap-1.5">
 <div className="flex items-center justify-between px-3 py-1 mb-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
 {t("navigation", "Navigasyon")}
 </span>
 </div>
 {navGroups.map(group => {
 const GroupIcon = group.icon;
 const isOpen = openGroups.has(group.id);
 const hasActiveChild = group.items.some(item => isRouteActive(pathname, item.route));

 return (
 <div key={group.id} className="mb-0.5">
 <button
 type="button"
 onClick={() => toggleGroup(group.id)}
 className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
 hasActiveChild 
 ? 'text-slate-900 bg-slate-100/80' 
 : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
 }`}
 >
 <div className="flex items-center gap-2.5 min-w-0">
 <GroupIcon className={`h-4 w-4 shrink-0 ${hasActiveChild ? 'text-slate-900' : 'text-slate-400'}`} strokeWidth={2} />
 <span className="truncate uppercase tracking-wider text-[11px]">{t(group.labelKey || group.label)}</span>
 </div>
 <ChevronDown className={`h-3.5 w-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
 </button>
 {isOpen && (
 <div className="mt-1 ml-3.5 pl-3 border-l-2 border-slate-200/80 space-y-0.5">
 {group.items.map(item => {
 const ItemIcon = item.icon;
 const active = isRouteActive(pathname, item.route);
 return (
 <Link
 key={`${group.id}-${item.route}`}
 to={item.route}
 className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs transition-all ${
 active
 ? 'bg-slate-900 text-white font-bold shadow-xs'
 : 'text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900'
 }`}
 >
 <ItemIcon className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} strokeWidth={active ? 2.5 : 2} />
 <span className="truncate">{t(item.nameKey || item.name)}</span>
 </Link>
 );
 })}
 </div>
 )}
 </div>
 );
 })}
 </nav>
 </aside>

 {/* ── Main Dashboard Workspace ── */}
 <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:pl-2 overflow-y-auto">
 <PageContainer className="max-w-5xl">
 
 {/* Expiration Warning Alert */}
 {isExpiringSoon && (
 <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-3 shadow-xs">
 <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
 <div className="flex-1 min-w-0">
 <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">{t("your_membership_expires_soon", "Üyeliğiniz Yakında Sona Eriyor")}</h4>
 <p className="text-xs mt-0.5 text-amber-900/90 font-medium">
 {t('expires_on', { date: new Date(expirationDate).toLocaleDateString(i18n?.language?.startsWith('tr') ? 'tr-TR' : 'en-US') })}
 {!autoRenew && ` • ${t("auto_renew_off_warning", "Otomatik yenileme kapalı.")}`}
 </p>
 </div>
 <button
 onClick={() => setShowUpgrade(true)}
 className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
 >
 {t('renew_now', 'Yenile')}
 </button>
 </div>
 )}

 {/* ── Welcome Header & Context Banner ── */}
 <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <div className="flex items-center gap-2">
 <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
 {t("welcome", "Hoş Geldiniz, ")} {user?.name?.split(' ')[0] || 'Kullanıcı'}
 </h1>
 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
 v2.4
 </span>
 </div>
 <p className="mt-1 text-xs text-slate-500 font-medium">
 {t("your_personal_secondhand_space", "İlanlarınızı, siparişlerinizi, bakiye hareketlerinizi ve ayrıcalıklarınızı buradan takip edin.")}
 </p>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <Link
 to={ROUTES.CREATE_LISTING}
 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-900 text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow-sm transition-all active:scale-[0.98]"
 >
 <Plus className="w-4 h-4" strokeWidth={2.5} />
 <span>{t("sell_item", "Yeni İlan Ver")}</span>
 </Link>
 </div>
 </div>

 {/* ── 4-Column Operational Bento Metrics ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 
 {/* Widget 1: Active Listings */}
 <Link
 to={ROUTES.MY_LISTINGS}
 className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
 >
 <div className="flex items-center justify-between mb-3">
 <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:scale-105 transition-transform">
 <Package className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-extrabold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-300/50">
 {t('active', 'Aktif')}
 </span>
 </div>
 <div>
 <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
 {activeListingsCount}
 </div>
 <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
 <span>{t('active_listings_sub', 'Yayında olan ilanlar')}</span>
 <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
 </p>
 </div>
 </Link>

 {/* Widget 2: In-Transit / Active Orders */}
 <Link
 to={ROUTES.MY_ORDERS}
 className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
 >
 <div className="flex items-center justify-between mb-3">
 <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform">
 <Truck className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-blue-200/50">
 {t('in_transit_tab', 'Süreçte')}
 </span>
 </div>
 <div>
 <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
 {inTransitOrdersCount}
 </div>
 <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
 <span>{t('in_transit_orders_sub', 'Devam eden teslimatlar')}</span>
 <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
 </p>
 </div>
 </Link>

 {/* Widget 3: Total Orders */}
 <Link
 to={ROUTES.MY_ORDERS}
 className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
 >
 <div className="flex items-center justify-between mb-3">
 <div className="w-10 h-10 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 group-hover:scale-105 transition-transform">
 <ShoppingBag className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-200">
 {t('all_orders', 'Siparişler')}
 </span>
 </div>
 <div>
 <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
 {totalOrdersCount}
 </div>
 <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
 <span>{t('all_orders_sub', 'Toplam alışveriş sayısı')}</span>
 <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
 </p>
 </div>
 </Link>

 {/* Widget 4: Aura AI Usage */}
 <Link
 to={ROUTES.AURA_CHAT}
 className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all group flex flex-col justify-between"
 >
 <div className="flex items-center justify-between mb-3">
 <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-105 transition-transform">
 <Sparkles className="w-5 h-5" />
 </div>
 <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-200/60">
 Aura AI
 </span>
 </div>
 <div>
 <div className="flex items-baseline gap-1 text-2xl font-extrabold text-slate-900 tracking-tight">
 <span>{dailyAuraUsage}</span>
 <span className="text-xs font-medium text-slate-400 font-sans">/ {dailyAuraLimit || 8}</span>
 </div>
 <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center justify-between">
 <span>{t('aura_quota_sub', 'Günlük mesaj kotası')}</span>
 <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
 </p>
 </div>
 </Link>
 </div>

 {/* ── Membership & Privileges Showcase Bento Card ── */}
 <div className="mb-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 lg:p-7">
 <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
 <div className="flex items-center gap-2.5">
 <div className={`p-2 rounded-xl ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
 <Crown className="w-4 h-4" />
 </div>
 <div>
 <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">
 {t("membership_and_privileges", "Üyelik ve Ayrıcalıklar")}
 </h2>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5">
 {isPremium ? t('premium_status_desc', 'Premium üyeliğinize ait limitler ve teslimat öncelikleri') : t('standard_status_desc', 'Standart plan ve premium avantaj karşılaştırması')}
 </p>
 </div>
 </div>

 {!isPremium && (
 <button
 onClick={() => setShowUpgrade(true)}
 className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
 >
 <Zap className="w-3.5 h-3.5 fill-current" />
 <span>{t('upgrade_btn', 'Yükselt')}</span>
 </button>
 )}
 </div>

 {isPremium ? (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left: Perks & Quota Usage */}
 <div className="lg:col-span-2 space-y-5">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
 <Crown className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-sm font-extrabold text-slate-900">{t("premium_membership_active", "Premium Üyelik Aktif")}</h3>
 <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
 {plan || 'PRO'}
 </span>
 </div>
 <p className="text-xs text-slate-500 mt-0.5 font-medium">{t("enjoy_premium_perks", "Öncelikli kargo, ek vitrin slotları ve genişletilmiş AI desteği aktif.")}</p>
 </div>
 </div>

 {/* Aura AI Quota Visual Bar */}
 <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
 <div className="flex justify-between text-xs font-bold text-slate-700">
 <span className="flex items-center gap-1.5">
 <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
 {t("aura_ai_message", "Aura AI Günlük Kullanım")}
 </span>
 <span className="text-slate-900 font-extrabold">
 {dailyAuraUsage} / {dailyAuraLimit}
 </span>
 </div>
 <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
 <div 
 className="h-full bg-amber-500 rounded-full transition-all duration-500" 
 style={{ width: `${Math.min(100, (dailyAuraUsage / (dailyAuraLimit || 8)) * 100)}%` }} 
 />
 </div>
 </div>

 {/* 4 Feature Micro-Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
 <div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("fast_shipping", "Teslimat Süresi")}</div>
 <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">{estimatedShippingDays} {t('days_priority', 'Gün (Öncelikli)')}</span>
 </div>
 <Truck className="w-4 h-4 text-slate-900 shrink-0" />
 </div>

 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
 <div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("shipping_process", "İşleme Hızı")}</div>
 <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">{orderProcessingSpeed || 'Aynı Gün'}</span>
 </div>
 <Zap className="w-4 h-4 text-amber-500 shrink-0" />
 </div>

 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
 <div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("aura_ai_message_limit", "Aura AI Limiti")}</div>
 <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">{dailyAuraLimit} {t('messages_daily', 'Mesaj / Gün')}</span>
 </div>
 <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
 </div>

 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
 <div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("showcase_slot", "Vitrin Slotu")}</div>
 <span className="text-xs font-extrabold text-slate-900 mt-0.5 block">{activeShowcasesCount} / {maxShowcaseSlots} {t('slot_active', 'Slot')}</span>
 </div>
 <Layers className="w-4 h-4 text-slate-500 shrink-0" />
 </div>
 </div>
 </div>

 {/* Right: Subscription Actions Card */}
 <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex flex-col justify-between">
 <div className="space-y-3">
 <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
 {t('subscription_details', 'Abonelik Bilgileri')}
 </span>
 
 {purchaseDate && (
 <div className="flex items-center justify-between text-xs">
 <span className="text-slate-500 font-medium">{t("start_date", "Başlangıç")}</span>
 <span className="font-bold text-slate-900 ">{formatDate(purchaseDate)}</span>
 </div>
 )}

 {expirationDate && (
 <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
 <span className="text-slate-500 font-medium">{t("end_date", "Bitiş")}</span>
 <span className="font-bold text-slate-900 ">{formatDate(expirationDate)}</span>
 </div>
 )}

 <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
 <span className="text-slate-500 font-medium">{t("auto_renew", "Otomatik Yenileme")}</span>
 <span className={`font-bold ${autoRenew ? 'text-slate-900' : 'text-slate-500'}`}>
 {autoRenew ? t("enabled_default", "Açık") : t("disabled", "Kapalı")}
 </span>
 </div>
 </div>

 <div className="mt-5 pt-3 border-t border-slate-200/80">
 {autoRenew ? (
 <button 
 onClick={handleCancelSubscription}
 disabled={isCancelling}
 className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.98]"
 >
 {isCancelling ? t("processing_progress", "İşleniyor...") : t("cancel_subscription", "Yenilemeyi Kapat")}
 </button>
 ) : (
 <button 
 onClick={() => toggleAutoRenew(true)}
 disabled={isTogglingAutoRenew}
 className="w-full py-2.5 bg-slate-900 hover:bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.98]"
 >
 {isTogglingAutoRenew ? t("enabling", "Açılıyor...") : t("reactivate", "Tekrar Aç")}
 </button>
 )}
 </div>
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Left: Standard limits overview */}
 <div className="lg:col-span-2 space-y-4">
 <div className="flex items-center gap-3">
 <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center border border-slate-200 shrink-0">
 <UserCheck className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h3 className="text-sm font-extrabold text-slate-900">{t('current_plan_standard', 'Mevcut Plan: Standart (Ücretsiz)')}</h3>
 <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
 STANDART
 </span>
 </div>
 <p className="text-xs text-slate-500 mt-0.5 font-medium">{t('standard_limits_summary', 'Temel alım-satım, güvenli ödeme ve kargo özellikleri devrededir.')}</p>
 </div>
 </div>

 {/* Standard Quota Progress */}
 <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
 <div className="flex justify-between text-xs font-bold text-slate-700">
 <span className="flex items-center gap-1.5">
 <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
 {t('aura_ai_daily_limit', 'Aura AI Mesaj Kotası')}
 </span>
 <span className="text-slate-900 font-extrabold">{dailyAuraUsage} / {dailyAuraLimit || 2}</span>
 </div>
 <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
 <div 
 className="h-full bg-slate-500 rounded-full transition-all duration-500" 
 style={{ width: `${Math.min(100, (dailyAuraUsage / (dailyAuraLimit || 2)) * 100)}%` }} 
 />
 </div>
 </div>

 {/* Standard vs Premium comparison items */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('delivery_time', 'Teslimat Süresi')}</div>
 <div className="text-xs font-bold text-slate-700 mt-0.5">
 {estimatedShippingDays} {t('days', 'Gün')} <span className="text-slate-900 font-extrabold">({t('with_premium', 'Premium ile')} {premiumEstimatedShippingDays} {t('days', 'Gün')})</span>
 </div>
 </div>

 <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('showcase_slot_limit', 'Vitrin Slot Limiti')}</div>
 <div className="text-xs font-bold text-slate-700 mt-0.5">
 {maxShowcaseSlots} {t('slot', 'Slot')} <span className="text-slate-900 font-extrabold">({t('with_premium', 'Premium ile')} {premiumMaxShowcaseSlots} {t('slot', 'Slot')})</span>
 </div>
 </div>
 </div>
 </div>

 {/* Right: Premium Callout Box */}
 <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 rounded-3xl flex flex-col justify-between shadow-sm relative overflow-hidden">
 <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-slate-800/10 rounded-full blur-xl pointer-events-none" />
 
 <div className="space-y-3 relative z-10">
 <div className="inline-flex p-2.5 bg-slate-800/20 text-slate-600 rounded-2xl border border-slate-700/30">
 <Crown className="w-5 h-5 fill-current" />
 </div>
 <div>
 <h4 className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">{t('why_upgrade_premium', 'Neden Premium?')}</h4>
 <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
 {t('premium_benefit_highlight', 'İlanlarınız %40 daha hızlı alıcı bulsun. Öncelikli kargo, ekstra vitrin slotları ve sınırsız Aura AI desteği kazanın.')}
 </p>
 </div>
 </div>

 <button
 onClick={() => setShowUpgrade(true)}
 className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-600 text-slate-950 font-extrabold uppercase tracking-wider text-xs shadow-sm transition-all cursor-pointer mt-5 active:scale-[0.98]"
 >
 {t('upgrade_to_premium', 'Premium\'a Yükselt')}
 </button>
 </div>
 </div>
 )}
 </div>

 <PremiumUpgradeModal
 isOpen={showUpgrade}
 onClose={() => setShowUpgrade(false)}
 />

 {/* ── Quick Utility Tiles ── */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
 <Link 
 to={ROUTES.EWALLET} 
 className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 hover:shadow-xs group"
 >
 <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:scale-105 transition-transform">
 <Wallet className="w-5 h-5" strokeWidth={2} />
 </div>
 <div className="min-w-0 flex-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">{t("finance", "Finans")}</span>
 <h3 className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">{t("my_wallet", "Cüzdan & Bakiye")}</h3>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{t("wallet_sub", "Escrow ve bakiye hareketleri")}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
 </Link>

 <Link 
 to={ROUTES.FAVORITES} 
 className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 hover:shadow-xs group"
 >
 <div className="h-11 w-11 shrink-0 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
 <Heart className="w-5 h-5" strokeWidth={2} />
 </div>
 <div className="min-w-0 flex-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">{t("saved", "Kaydedilenler")}</span>
 <h3 className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">{t("my_favorites", "Favorilerim")}</h3>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{t("favorites_sub", "Takip ettiğiniz ürünler")}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
 </Link>

 <Link 
 to={ROUTES.INBOX} 
 className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 hover:shadow-xs group"
 >
 <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 group-hover:scale-105 transition-transform">
 <MessageSquare className="w-5 h-5" strokeWidth={2} />
 </div>
 <div className="min-w-0 flex-1">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">{t("communication", "İletişim")}</span>
 <h3 className="text-xs font-extrabold text-slate-900 mt-0.5 truncate">{t("inbox", "Mesajlar & Teklifler")}</h3>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">{t("inbox_sub", "Alıcı ve satıcı görüşmeleri")}</p>
 </div>
 <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
 </Link>
 </div>

 {/* ── Recent Orders Stream Bento Box ── */}
 <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 lg:p-7 mb-8">
 <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
 <div>
 <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">{t("recent_orders", "Son Siparişler")}</h2>
 <p className="text-[11px] text-slate-500 font-medium mt-0.5">{t("recent_orders_desc", "Son alışverişleriniz ve anlık kargo durumları")}</p>
 </div>
 <Link 
 to={ROUTES.MY_ORDERS} 
 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1 hover:text-slate-900 transition-colors"
 >
 <span>{t("view_all", "Tümünü Gör")}</span>
 <ArrowRight className="w-4 h-4" strokeWidth={2} />
 </Link>
 </div>

 {ordersLoading ? (
 <div className="space-y-3">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
 ))}
 </div>
 ) : recentOrders.length === 0 ? (
 <div className="text-center py-12 select-none">
 <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200">
 <ShoppingBag className="w-5 h-5 text-slate-400" />
 </div>
 <h3 className="text-sm font-extrabold text-slate-900">{t("your_shopping_bag_is_waiting", "Henüz bir siparişiniz bulunmuyor")}</h3>
 <p className="text-xs text-slate-500 mt-1 font-medium max-w-sm mx-auto">
 {t("explore_our_second_hand_listings_to_find", "Avantajlı ikinci el ürünleri ve fırsatları keşfetmeye hemen başlayın.")}
 </p>
 <Link 
 to={ROUTES.LISTINGS} 
 className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white hover:bg-slate-900 transition-all shadow-xs"
 >
 {t("explore_listings", "İlanları Keşfet")}
 </Link>
 </div>
 ) : (
 <div className="space-y-3">
 {recentOrders.map(order => {
 const items = order.orderItems || order.items || [];
 const firstItem = items[0];
 const listing = firstItem?.listing;
 const thumbUrl = listing?.imageUrl || firstItem?.imageUrl;
 const lineTitle = listing?.title || firstItem?.title;
 
 const statusConfig = {
 COMPLETED: { label: t('status_completed', 'Teslim Edildi'), style: 'bg-slate-100 text-slate-900 border-slate-300/60' },
 DELIVERED: { label: t('status_delivered', 'Teslim Edildi'), style: 'bg-slate-100 text-slate-900 border-slate-300/60' },
 SHIPPED: { label: t('status_shipped', 'Kargoya Verildi'), style: 'bg-blue-50 text-blue-800 border-blue-200/60' },
 IN_TRANSIT: { label: t('status_in_transit', 'Kargoda'), style: 'bg-blue-50 text-blue-800 border-blue-200/60' },
 PROCESSING: { label: t('status_processing', 'Hazırlanıyor'), style: 'bg-amber-50 text-amber-800 border-amber-200/60' },
 CANCELLED: { label: t('status_cancelled', 'İptal Edildi'), style: 'bg-rose-50 text-rose-800 border-rose-200/60' },
 }[order.status] || { label: order.status?.replace(/_/g, ' '), style: 'bg-slate-100 text-slate-700 border-slate-200' };

 return (
 <Link
 key={order.id}
 to={ROUTES.MY_ORDERS}
 className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 group"
 >
 <div className="flex items-center gap-3.5 min-w-0">
 <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200 group-hover:scale-[1.02] transition-transform">
 {thumbUrl ? (
 <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
 ) : (
 <ShoppingBag className="w-5 h-5 text-slate-400" />
 )}
 </div>
 <div className="min-w-0">
 <h3 className="text-xs font-extrabold text-slate-900 truncate">
 {order.name || lineTitle || `Order #${order.orderNumber}`}
 </h3>
 <div className="flex items-center gap-2 mt-1">
 <span className="text-[11px] text-slate-400 font-bold">#{order.orderNumber}</span>
 <span className="text-slate-300">•</span>
 <span className="text-[11px] text-slate-500 font-medium">
 {order.createdAt ? formatDate(order.createdAt) : ''}
 </span>
 </div>
 <div className="mt-1.5">
 <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${statusConfig.style}`}>
 {statusConfig.label}
 </span>
 </div>
 </div>
 </div>

 <div className="text-right shrink-0 ml-3">
 <p className="text-sm font-extrabold text-slate-900 tracking-tight">
 {formatCurrency(order.totalAmount ?? order.total ?? 0, order.currency || 'TRY')}
 </p>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
 {items.length} {items.length > 1 ? t('items', 'Ürün') : t('item', 'Ürün')}
 </span>
 </div>
 </Link>
 );
 })}
 </div>
 )}
 </div>

 {/* ── Active Showcases & Promotions Panel ── */}
 <MyShowcasesPanel userId={user?.id} />

 </PageContainer>
 </main>
 </div>
 );
};

export default AccountHubPage;