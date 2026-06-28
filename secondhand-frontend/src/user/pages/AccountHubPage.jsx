import PageContainer from '@/common/components/layout/PageContainer';
import {useTranslation} from "react-i18next";
import React, {useMemo, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Crown,
  Heart,
  MapPin,
  MessageSquare,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wallet,
  AlertTriangle
} from 'lucide-react';
import {useQuery} from '@tanstack/react-query';
import {usePlan} from '@/common/hooks/usePlan';
import PremiumUpgradeModal from '@/common/components/ui/PremiumUpgradeModal';
import {useAuthState} from '../../auth/AuthContext.jsx';
import {ROUTES} from '../../common/constants/routes.js';
import {USER_DEFAULTS} from '../userConstants.js';
import {getAccountHubNavGroups} from '../utils/accountHubSections.js';
import {isAdminUser} from '../../common/utils/admin.js';
import {orderService} from '../../order/services/orderService.js';
import {formatCurrency} from '../../common/formatters.js';
import MyShowcasesPanel from '../../showcase/components/MyShowcasesPanel.jsx';
import {useMyShowcases} from '../../showcase/hooks/useMyShowcases.js';

const getInitials = name => {
  const value = (name || '').trim();
  if (!value) return USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};
const isRouteActive = (pathname, route) => pathname === route;
const AccountHubPage = () => {
  const {
    t
  } = useTranslation();
  const {
    user
  } = useAuthState();
  const {
    pathname
  } = useLocation();
  const [openGroups, setOpenGroups] = useState(() => new Set(['overview', 'buying']));
  const navGroups = useMemo(() => {
    const id = user?.id;
    return getAccountHubNavGroups(id ?? 0, {
      isAdmin: isAdminUser(user)
    });
  }, [user]);
  const toggleGroup = id => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);else next.add(id);
      return next;
    });
  };
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
    freeDailyAuraLimit,
    premiumDailyAuraLimit,
    freeEstimatedShippingDays,
    premiumEstimatedShippingDays,
    freeOrderProcessingSpeed,
    premiumOrderProcessingSpeed
  } = usePlan();
  const { showcases } = useMyShowcases(user?.id);
  const activeShowcasesCount = useMemo(() => showcases ? showcases.filter(s => new Date(s.endDate) > new Date()).length : 0, [showcases]);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isExpiringSoon = useMemo(() => {
    if (!isPremium || !expirationDate) return false;
    const diff = new Date(expirationDate) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    return days > 0 && days <= 3;
  }, [isPremium, expirationDate]);

  const handleCancelSubscription = () => {
    if (window.confirm('Aboneliğinizi iptal etmek istediğinize emin misiniz? Gelecek dönem için otomatik yenileme kapatılacaktır.')) {
      cancelSubscription();
    }
  };

  if (!user) {
    return <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>;
  }
  return <div className="min-h-screen bg-background-secondary flex flex-col lg:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-[320px] bg-transparent flex-shrink-0 flex flex-col p-6 lg:py-10 lg:pl-10 lg:pr-6 select-none">
        {/* User Card */}
        <div className="bg-background-primary rounded-2xl p-5 shadow-sm border border-border-light mb-6 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden">
            {user?.profilePicture ? <img src={user.profilePicture} alt="" className="h-full w-full object-cover" /> : getInitials(`${user?.name || ''} ${user?.surname || ''}`)}
          </div>
          <div className="overflow-hidden min-w-0">
            <h2 className="text-lg font-semibold text-text-primary truncate">
              {user?.name ? `${user.name}${user.surname ? ` ${user.surname}` : ''}` : 'User'}
            </h2>
            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email || ''}</p>
          </div>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <nav className="flex lg:hidden overflow-x-auto gap-2 pb-4 scrollbar-none -mx-2 px-2">
          {navGroups.map(group => {
          return group.items.map(item => {
            const active = isRouteActive(pathname, item.route);
            return <Link key={`mobile-${group.id}-${item.route}`} to={item.route} className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${active ? 'bg-primary text-white shadow-sm' : 'bg-background-primary text-text-secondary border border-border-light hover:bg-secondary-light'}`}>
                  {item.name}
                </Link>;
          });
        })}
        </nav>

        {/* Desktop Navigation Groups */}
        <nav className="hidden lg:flex flex-col gap-2">
          <span className="text-caption font-bold uppercase tracking-widest text-text-muted px-3 mb-2">{t("private_space")}</span>
          {navGroups.map(group => {
          const GroupIcon = group.icon;
          const isOpen = openGroups.has(group.id);
          return <div key={group.id} className="mb-2">
                <button type="button" onClick={() => toggleGroup(group.id)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs font-bold uppercase tracking-wider text-text-muted hover:bg-secondary-light transition-colors">
                  <ChevronDown className={`h-3.5 w-3.5 text-text-muted shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                  <GroupIcon className="h-4 w-4 text-text-muted shrink-0" strokeWidth={2} />
                  <span className="truncate">{group.label}</span>
                </button>
                {isOpen && <div className="mt-1.5 ml-2.5 pl-3 border-l border-slate-100 space-y-1">
                    {group.items.map(item => {
                const ItemIcon = item.icon;
                const active = isRouteActive(pathname, item.route);
                return <Link key={`${group.id}-${item.route}`} to={item.route} className={`flex items-center gap-3 px-4 py-2.5 rounded-full text-xs transition-all ${active ? 'bg-primary text-white font-bold shadow-sm' : 'text-text-secondary font-semibold hover:bg-secondary-light hover:text-text-primary'}`}>
                          <ItemIcon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-text-muted'}`} strokeWidth={active ? 2.5 : 2} />
                          <span className="truncate">{item.name}</span>
                        </Link>;
              })}
                  </div>}
                </div>;
        })}
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10 lg:pl-4 overflow-y-auto">
        <PageContainer className="max-w-4xl">
          {isExpiringSoon && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">Üyeliğiniz Yakında Sona Erecek</h4>
                <p className="text-xs mt-1 font-medium">
                  Premium üyeliğiniz {new Date(expirationDate).toLocaleDateString('tr-TR')} tarihinde sona erecektir.
                  {!autoRenew && " Otomatik yenileme kapalıdır. Avantajlarınızı kaybetmemek için otomatik yenilemeyi açabilirsiniz."}
                </p>
              </div>
            </div>
          )}

          {/* Header Panel */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary tracking-tight">{t("welcome")}{user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className="mt-1 text-sm text-text-secondary font-medium">{t("your_personal_secondhand_space")}</p>
            </div>
            {/* Secure Trust Badge */}
            <div className="inline-flex items-center self-start gap-1.5 rounded-full bg-status-success-bg border border-status-success-border px-3.5 py-1.5 text-xs font-bold text-status-success select-none shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" strokeWidth={2.5} />
              <span>{t("escrow_secured_member")}</span>
            </div>
          </div>

          {/* Unified Premium Space */}
          <div className="mb-8 bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Üyelik ve Ayrıcalıklar
            </h2>
            
            {isPremium ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Plan Quotas & Benefits (col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Status header */}
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Premium Üyelik Aktif</h3>
                        <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {plan}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Premium avantajlarınızın tadını çıkarın.</p>
                    </div>
                  </div>

                  {/* Quota Progress */}
                  <div className="space-y-2 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        Aura AI Mesajı
                      </span>
                      <span className="font-bold text-slate-900">{dailyAuraUsage} / {dailyAuraLimit}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (dailyAuraUsage / (dailyAuraLimit || 8)) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  {/* Benefits Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Hızlı Teslimat</div>
                      <span className="text-xs font-bold text-emerald-600">{estimatedShippingDays} Gün (Kargo Önceliği)</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kargo Süreci</div>
                      <span className="text-xs font-bold text-emerald-600">{orderProcessingSpeed} (Hazırlık Hızı)</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aura AI Mesaj Limiti</div>
                      <span className="text-xs font-bold text-slate-900">Günlük {dailyAuraLimit} Mesaj</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Showcase Slotu</div>
                      <span className="text-xs font-bold text-slate-900">{activeShowcasesCount} / {maxShowcaseSlots} Slot Aktif</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Subscription Admin Control */}
                <div className="bg-slate-50 border border-slate-200/60 p-5 rounded-3xl md:min-w-[240px] flex flex-col justify-between items-stretch z-10 shadow-sm">
                  {/* Top: Başlangıç Tarihi */}
                  <div className="space-y-3">
                    {purchaseDate && (
                      <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Başlangıç Tarihi</span>
                        <span className="text-xs font-bold text-slate-900 mt-0.5">{new Date(purchaseDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                    
                    {/* Under it: Bitiş Tarihi */}
                    {expirationDate && (
                      <div className="flex flex-col items-start text-left border-t border-slate-100 pt-2.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bitiş Tarihi</span>
                        <span className="text-xs font-bold text-slate-900 mt-0.5">{new Date(expirationDate).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}

                    {/* Status: Otomatik Yenileme */}
                    <div className="border-t border-slate-100 pt-2.5 flex flex-col items-start text-left">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Otomatik Yenileme</span>
                      <span className={`text-xs font-bold mt-0.5 ${autoRenew ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {autoRenew ? 'Açık (Varsayılan)' : 'Kapalı'}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Cancel or Resume Button */}
                  <div className="mt-5 pt-3 border-t border-slate-250">
                    {autoRenew ? (
                      <button 
                        onClick={handleCancelSubscription}
                        disabled={isCancelling}
                        className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-rose-500/10"
                      >
                        {isCancelling ? 'İşleniyor...' : 'Aboneliği İptal Et'}
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 inline-block w-full text-center">
                          Otomatik Yenileme Kapalı
                        </span>
                        <button 
                          onClick={() => toggleAutoRenew(true)}
                          disabled={isTogglingAutoRenew}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-500/10"
                        >
                          {isTogglingAutoRenew ? 'Etkinleştiriliyor...' : 'Yeniden Etkinleştir'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Current standard features & visual hints (col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 shrink-0">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">Mevcut Plan: Ücretsiz</h3>
                        <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          STANDART
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-medium">Sınırlı özelliklerle temel kullanım</p>
                    </div>
                  </div>

                  {/* Standard Quota Progress */}
                  <div className="space-y-1.5 bg-slate-50/50 border border-slate-100 p-4 rounded-2xl max-w-md">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Aura AI Mesajı</span>
                      <span className="font-bold text-slate-900">{dailyAuraUsage}/{dailyAuraLimit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-500 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (dailyAuraUsage / (dailyAuraLimit || 2)) * 100)}%` }} 
                      />
                    </div>
                  </div>

                  {/* Features Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Teslimat Süresi</div>
                      <span className="text-xs font-bold text-slate-650">{estimatedShippingDays} Gün (Premium ile {premiumEstimatedShippingDays} Gün)</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kargo Süreci</div>
                      <span className="text-xs font-bold text-slate-650">{orderProcessingSpeed} (Premium ile {premiumOrderProcessingSpeed})</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Aura AI Mesaj Limiti</div>
                      <span className="text-xs font-bold text-slate-900">Günlük {dailyAuraLimit} Mesaj (Premium ile {premiumDailyAuraLimit})</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50/50 border border-slate-100">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Showcase Slotu</div>
                      <span className="text-xs font-bold text-slate-900">{activeShowcasesCount} / {maxShowcaseSlots} Slot ({premiumMaxShowcaseSlots} Premium)</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Premium Upgrade Callout Box */}
                <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-3xl flex flex-col justify-between items-center text-center shadow-sm">
                  <div className="my-auto space-y-4 w-full">
                    <div className="inline-flex p-3 bg-amber-500/10 text-amber-600 rounded-2xl border border-amber-500/20">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Premium Avantajları</span>
                      <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                        Premium'a geçerek kargo sürelerinde öncelik kazanın ve daha fazla ilan öne çıkarın. İlanlarınız %40 daha hızlı alıcı bulsun.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowUpgrade(true)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold uppercase tracking-wider text-xs shadow-sm hover:shadow-md transition-colors cursor-pointer mt-5"
                  >
                    Premium'a Yükselt
                  </button>
                </div>
              </div>
            )}
          </div>

          <PremiumUpgradeModal
            isOpen={showUpgrade}
            onClose={() => setShowUpgrade(false)}
          />

          {/* Mini Summary Row */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <Link to={ROUTES.MY_LISTINGS} className="bg-background-primary rounded-2xl p-4 border border-border-light shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md">
              <Sparkles className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-caption font-bold uppercase tracking-wider text-text-muted">{t("listings")}</span>
              <span className="text-sm font-bold text-text-primary mt-0.5">{t("manage_items")}</span>
            </Link>
            <Link to={ROUTES.FAVORITES} className="bg-background-primary rounded-2xl p-4 border border-border-light shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md">
              <Heart className="w-5 h-5 text-status-error mb-1.5" />
              <span className="text-caption font-bold uppercase tracking-wider text-text-muted">{t("saved")}</span>
              <span className="text-sm font-bold text-text-primary mt-0.5">{t("my_favorites")}</span>
            </Link>
            <Link to={ROUTES.CHAT} className="bg-background-primary rounded-2xl p-4 border border-border-light shadow-sm flex flex-col items-center justify-center text-center transition hover:shadow-md">
              <MessageSquare className="w-5 h-5 text-primary mb-1.5" />
              <span className="text-caption font-bold uppercase tracking-wider text-text-muted">{t("inbox")}</span>
              <span className="text-sm font-bold text-text-primary mt-0.5">{t("chat_history")}</span>
            </Link>
          </div>

          {/* Recent Orders Box */}
          <div className="bg-background-primary rounded-2xl border border-border-light shadow-sm p-6 lg:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text-primary uppercase tracking-widest">{t("recent_orders")}</h2>
              <Link to={ROUTES.MY_ORDERS} className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 hover:text-primary transition-colors">{t("view_all")}<ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Link>
            </div>

            {ordersLoading ? <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-background-tertiary animate-pulse border border-border-light" />)}
              </div> : recentOrders.length === 0 ? <div className="text-center py-12 select-none">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-background-tertiary border border-border-light">
                  <ShoppingBag className="w-5 h-5 text-text-muted" />
                </div>
                <h3 className="text-sm font-medium text-text-primary">{t("your_shopping_bag_is_waiting")}</h3>
                <p className="text-xs text-text-muted mt-1">{t("explore_our_second_hand_listings_to_find")}</p>
                <Link to={ROUTES.LISTINGS} className="mt-6 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-hover transition-all">{t("explore_listings")}</Link>
              </div> : <div className="space-y-4">
                {recentOrders.map(order => {
              const items = order.orderItems || order.items || [];
              const firstItem = items[0];
              const listing = firstItem?.listing;
              const thumbUrl = listing?.imageUrl || firstItem?.imageUrl;
              const lineTitle = listing?.title || firstItem?.title;
              const statusColor = order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-status-success-bg text-status-success border-status-success-border' : order.status === 'CANCELLED' ? 'bg-status-error-bg text-status-error border-status-error-border' : 'bg-status-warning-bg text-status-warning border-status-warning-border';
              return <Link key={order.id} to={ROUTES.MY_ORDERS} className="flex items-center justify-between p-4 rounded-2xl border border-border-light bg-background-primary hover:bg-secondary-light hover:shadow-sm transition-all duration-300">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-xl bg-background-primary overflow-hidden flex-shrink-0 flex items-center justify-center border border-border-light shadow-sm">
                          {thumbUrl ? <img src={thumbUrl} alt="" className="w-full h-full object-cover" /> : <ShoppingBag className="w-5 h-5 text-text-muted" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-text-primary truncate">
                            {order.name || lineTitle || `Order #${order.orderNumber}`}
                          </h3>
                          <p className="text-xs text-text-muted mt-1 font-medium">
                            {order.orderNumber} •{' '}
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : ''}
                          </p>
                          <span className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-md text-caption font-bold uppercase tracking-wider border ${statusColor}`}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-base font-bold text-text-primary tracking-tight">
                          {formatCurrency(order.totalAmount ?? order.total ?? 0, order.currency)}
                        </p>
                      </div>
                    </Link>;
            })}
              </div>}
          </div>

          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link to={ROUTES.CREATE_LISTING} className="bg-background-primary rounded-2xl p-5 border border-border-light shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="h-10 w-10 shrink-0 rounded-full bg-background-tertiary border border-border-light flex items-center justify-center text-text-secondary">
                <Plus className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider">{t("sell_item")}</h3>
                <p className="text-caption text-text-muted font-medium mt-0.5">{t("create_a_listing")}</p>
              </div>
            </Link>
            <Link to={ROUTES.EWALLET} className="bg-background-primary rounded-2xl p-5 border border-border-light shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="h-10 w-10 shrink-0 rounded-full bg-background-tertiary border border-border-light flex items-center justify-center text-text-secondary">
                <Wallet className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider">{t("my_wallet")}</h3>
                <p className="text-caption text-text-muted font-medium mt-0.5">{t("top_up_balance")}</p>
              </div>
            </Link>
            <Link to={ROUTES.PROFILE} className="bg-background-primary rounded-2xl p-5 border border-border-light shadow-sm flex items-center gap-4 transition hover:shadow-md">
              <div className="h-10 w-10 shrink-0 rounded-full bg-background-tertiary border border-border-light flex items-center justify-center text-text-secondary">
                <MapPin className="w-4 h-4" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text-primary uppercase tracking-wider">{t("addresses")}</h3>
                <p className="text-caption text-text-muted font-medium mt-0.5">{t("manage_profiles")}</p>
              </div>
            </Link>
          </div>

          <MyShowcasesPanel userId={user?.id} />
        </PageContainer>
      </main>
    </div>;
};
export default AccountHubPage;