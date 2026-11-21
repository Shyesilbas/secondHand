import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu } from 'lucide-react';
import { Badge, Card } from '../../../common/components/ui/index.js';
import { ROUTES } from '../../../common/constants/routes.js';
import { USER_DEFAULTS } from '../../userConstants.js';

const getInitials = (name) => {
  const value = (name || '').trim();
  if (!value) return USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const parts = value.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || USER_DEFAULTS.FALLBACK_NAME_INITIAL;
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
  return `${first}${last}`.toUpperCase();
};

const isRouteActive = (pathname, route) => pathname === route;

const NAV_ITEM = 'flex items-center gap-2.5 rounded px-3 py-2 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus';
const NAV_ITEM_ACTIVE = 'bg-accent-teal-50 font-medium text-accent-teal-800';
const NAV_ITEM_IDLE = 'text-text-secondary hover:bg-background-secondary hover:text-text-primary';

const formatGroupLabel = (text, isTr) => {
  if (!text) return '';
  const locale = isTr ? 'tr-TR' : 'en-US';
  const lower = text.toLocaleLowerCase(locale);
  return lower.charAt(0).toLocaleUpperCase(locale) + lower.slice(1);
};

const AccountHubSidebar = ({
  user,
  fullName,
  isPremium,
  plan,
  isTr,
  trEn,
  pathname,
  navGroups,
  openGroups,
  toggleGroup,
  mobileMenuOpen,
  onToggleMobileMenu,
  onCloseMobileMenu
}) => {
  const { t } = useTranslation();

  const renderNavContent = (onItemClick) => (
    <div className="space-y-1">
      {navGroups.map((group) => {
        if (group.items.length === 1) {
          const item = group.items[0];
          const ItemIcon = item.icon;
          const active = isRouteActive(pathname, item.route);
          return (
            <div key={group.id} className="pb-1">
              <Link
                to={item.route}
                onClick={onItemClick}
                aria-current={active ? 'page' : undefined}
                className={`${NAV_ITEM} ${active ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`}
              >
                <ItemIcon className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="truncate">{t(item.nameKey || item.name)}</span>
              </Link>
            </div>
          );
        }

        const isOpen = openGroups.has(group.id);
        const hasActiveChild = group.items.some((item) => isRouteActive(pathname, item.route));
        const rawGroupLabel = t(group.labelKey || group.label);

        return (
          <div key={group.id} className="border-t border-border-light pt-1.5 first:border-t-0 first:pt-0">
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                hasActiveChild ? 'text-text-primary' : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              <span className="truncate">{formatGroupLabel(rawGroupLabel, isTr)}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-text-muted transition-transform duration-150 ${
                  isOpen ? '' : '-rotate-90'
                }`}
                strokeWidth={1.5}
                aria-hidden
              />
            </button>
            {isOpen && (
              <div className="mt-0.5 space-y-0.5 pb-1">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const active = isRouteActive(pathname, item.route);
                  return (
                    <Link
                      key={`${group.id}-${item.route}`}
                      to={item.route}
                      onClick={onItemClick}
                      aria-current={active ? 'page' : undefined}
                      className={`${NAV_ITEM} ${active ? NAV_ITEM_ACTIVE : NAV_ITEM_IDLE}`}
                    >
                      <ItemIcon
                        className={`h-4 w-4 shrink-0 ${active ? 'text-accent-teal' : 'text-text-tertiary'}`}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span className="truncate">{t(item.nameKey || item.name)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64 xl:w-72">
      <Card padding="compact">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-tertiary text-sm font-semibold text-text-secondary">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="" className="h-full w-full object-cover" />
            ) : (
              getInitials(`${user?.name || ''} ${user?.surname || ''}`)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-text-primary">{fullName}</h2>
            <p className="truncate text-sm text-text-tertiary">{user?.email || ''}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border-light pt-3 text-sm">
          <Badge variant={isPremium ? 'warning' : 'neutral'} dot>
            {isPremium ? plan || 'Premium' : t('standard', 'Standard')}
          </Badge>
          <Link
            to={ROUTES.PROFILE}
            className="rounded font-medium text-text-link transition-colors duration-150 hover:text-text-linkHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {t('edit', 'Edit')}
          </Link>
        </div>
      </Card>

      <div className="mt-3 lg:hidden">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          className="flex h-11 w-full items-center justify-between rounded border border-border bg-background-primary px-4 text-sm font-medium text-text-primary"
        >
          <span className="flex items-center gap-2">
            <Menu className="h-4 w-4 text-text-tertiary" strokeWidth={1.5} aria-hidden />
            <span>{t('account_hub', 'Account Hub')}</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 text-text-muted transition-transform duration-150 ${
              mobileMenuOpen ? 'rotate-180' : ''
            }`}
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
        {mobileMenuOpen && (
          <Card
            as="nav"
            padding="none"
            shadow={false}
            className="mt-2 p-2"
            aria-label={trEn('Hesap menüsü', 'Account navigation')}
          >
            {renderNavContent(onCloseMobileMenu)}
          </Card>
        )}
      </div>

      <Card
        as="nav"
        padding="none"
        className="mt-4 hidden p-2 lg:block"
        aria-label={trEn('Hesap menüsü', 'Account navigation')}
      >
        {renderNavContent(undefined)}
      </Card>
    </aside>
  );
};

export default AccountHubSidebar;
