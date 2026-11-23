import { useTranslation } from 'react-i18next';
import EmptyState from '../ui/EmptyState.jsx';
import { formatCurrency } from '../../formatters.js';
import {
  ArrowRight,
  ChevronRight,
  Compass,
  Image as ImageIcon,
  Inbox,
  PlusSquare,
  Search as MagnifyingGlassIcon,
  Sparkles,
  User
} from 'lucide-react';

const SearchResults = ({
  results,
  activeTab,
  selectedIndex,
  isLoading,
  query = '',
  onResultSelect
}) => {
  const { t } = useTranslation();

  const renderQuickLinks = () => {
    const quickLinks = [
      {
        label: t('quick_explore_categories', 'Kategorileri keşfet'),
        desc: t('quick_explore_categories_desc', 'Araç, emlak, elektronik ve diğer tüm ilanlara göz atın'),
        id: '/listings/prefilter',
        icon: Compass
      },
      {
        label: t('quick_start_selling', 'İlan ver'),
        desc: t('quick_start_selling_desc', 'Yeni bir ürünü hızlıca satışa çıkarın'),
        id: '/listings/prefilter?flow=create',
        icon: PlusSquare
      },
      {
        label: t('quick_account_hub', 'Hesap merkezi'),
        desc: t('quick_account_hub_desc', 'Profilinizi, ilanlarınızı ve siparişlerinizi yönetin'),
        id: '/dashboard',
        icon: User
      },
      {
        label: t('quick_aura_assistant', 'Aura AI Asistan'),
        desc: t('quick_aura_assistant_desc', 'Akıllı fiyat ve ilan asistanıyla sohbet edin'),
        id: '/aura',
        icon: Sparkles
      },
      {
        label: t('quick_inbox', 'Gelen kutusu'),
        desc: t('quick_inbox_desc', 'Mesajlarınızı, bildirimlerinizi ve e-postalarınızı görüntüleyin'),
        id: '/inbox',
        icon: Inbox
      }
    ];

    return (
      <div className="py-1">
        <div className="border-b border-border-light bg-background-secondary px-4 py-2">
          <span className="text-xs font-medium text-text-tertiary">{t('quick_navigation', 'Hızlı erişim')}</span>
        </div>
        {quickLinks.map((link, index) => {
          const Icon = link.icon;
          const isSelected = index === selectedIndex;
          return (
            <button
              key={link.id}
              type="button"
              onClick={() => onResultSelect({ id: link.id, type: 'link' })}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
                isSelected ? 'bg-background-tertiary' : 'hover:bg-background-secondary'
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded transition-colors duration-150 ${
                  isSelected ? 'bg-background-primary text-text-primary' : 'bg-background-tertiary text-text-tertiary'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-text-primary">{link.label}</div>
                <div className="mt-0.5 truncate text-sm text-text-tertiary">{link.desc}</div>
              </div>
              {isSelected && (
                <ChevronRight className="h-4 w-4 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
              )}
            </button>
          );
        })}
        <div className="flex items-center justify-between border-t border-border-light bg-background-secondary px-4 py-2 text-xs text-text-tertiary">
          <span>{t('navigate_enter_open_esc_close', 'Oklar: Gezin · Enter: Aç · Esc: Kapat')}</span>
          <span className="hidden sm:inline">{t('ctrl_tab_switch_mode', 'Ctrl+Tab: Mod değiştir')}</span>
        </div>
      </div>
    );
  };

  const renderUserResult = (user, index) => (
    <button
      key={user.id}
      type="button"
      onClick={() => onResultSelect(user)}
      className={`flex w-full items-center gap-3 border-b border-border-light px-4 py-2.5 text-left transition-colors duration-150 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
        index === selectedIndex ? 'bg-background-tertiary' : 'hover:bg-background-secondary'
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-sm font-semibold text-text-secondary">
        {user.name?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-primary">
          {user.name} {user.surname}
        </div>
        {user.accountCreationDate && (
          <div className="truncate text-sm text-text-tertiary">
            {t('member_since_year', {
              defaultValue: '{{year}} yılından beri üye',
              year: String(user.accountCreationDate).split('/').pop()
            })}
          </div>
        )}
      </div>
    </button>
  );

  const renderListingResult = (listing, index) => (
    <button
      key={listing.id}
      type="button"
      onClick={() => onResultSelect(listing)}
      className={`flex w-full items-center gap-3 border-b border-border-light px-4 py-2.5 text-left transition-colors duration-150 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
        index === selectedIndex ? 'bg-background-tertiary' : 'hover:bg-background-secondary'
      }`}
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-secondary-200">
        {listing.imageUrl ? (
          <img src={listing.imageUrl} alt={listing.title || ''} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-tertiary">
            <ImageIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-text-primary">{listing.title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-sm">
          {listing.price && (
            <span className="font-semibold tabular-nums tracking-tight text-text-price">
              {formatCurrency(listing.price, listing.currency)}
            </span>
          )}
          {listing.listingNo && (
            <span className="tabular-nums text-text-tertiary">#{listing.listingNo}</span>
          )}
        </div>
      </div>
    </button>
  );

  const renderPageResult = (page, index) => (
    <button
      key={`page-${page.key}`}
      type="button"
      onClick={() => onResultSelect(page)}
      className={`flex w-full items-center gap-3 border-b border-border-light px-4 py-2.5 text-left transition-colors duration-150 last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus ${
        index === selectedIndex ? 'bg-background-tertiary' : 'hover:bg-background-secondary'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-background-tertiary text-text-tertiary">
        <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </div>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">
        {t(page.labelKey)}
      </span>
    </button>
  );

  if (query.trim().length < 2) {
    return renderQuickLinks();
  }

  const pageHits = results.filter((result) => result.type === 'link');
  const itemResults = results.filter((result) => result.type !== 'link');

  if (results.length > 0) {
    return (
      <>
        {pageHits.length > 0 && (
          <>
            <div className="border-b border-border-light bg-background-secondary px-4 py-2">
              <div className="text-xs font-medium text-text-tertiary">{t('search_pages', 'Sayfalar')}</div>
            </div>
            {results.map((result, index) => (result.type === 'link' ? renderPageResult(result, index) : null))}
          </>
        )}

        {itemResults.length > 0 && (
          <>
            <div className="flex items-center justify-between border-b border-border-light bg-background-secondary px-4 py-2">
              <div className="text-xs font-medium text-text-tertiary">
                {activeTab === 'users'
                  ? t('search_users_results', 'Kullanıcı sonuçları')
                  : t('search_listings_results', 'İlan sonuçları')}
              </div>
              <div className="text-xs tabular-nums text-text-tertiary">
                {itemResults.length} {t('found', 'sonuç')}
              </div>
            </div>

            {results.map((result, index) =>
              result.type === 'link'
                ? null
                : activeTab === 'users'
                ? renderUserResult(result, index)
                : renderListingResult(result, index)
            )}
          </>
        )}

        <div className="flex items-center justify-between border-t border-border-light bg-background-secondary px-4 py-2 text-xs text-text-tertiary">
          <span>{t('navigate_enter_select_esc_close', 'Oklar: Gezin · Enter: Seç · Esc: Kapat')}</span>
          <span className="hidden sm:inline">{t('ctrl_tab_switch', 'Ctrl+Tab: Değiştir')}</span>
        </div>
      </>
    );
  }

  if (query.trim().length >= 2 && !isLoading) {
    return (
      <div className="p-2">
        <EmptyState
          icon={MagnifyingGlassIcon}
          title={
            activeTab === 'users'
              ? t('search_no_users', 'Kullanıcı bulunamadı')
              : t('search_no_listings', 'İlan bulunamadı')
          }
          description={t('search_try_different_keywords', 'Farklı anahtar kelimeler deneyin.')}
          size="compact"
          className="border-0 bg-transparent shadow-none"
        />
      </div>
    );
  }

  return null;
};

export default SearchResults;