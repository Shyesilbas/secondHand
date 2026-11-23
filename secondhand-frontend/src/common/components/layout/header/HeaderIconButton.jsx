import { Link, useLocation } from 'react-router-dom';

// Shared trigger sizing for every utility icon button in the header so hit boxes, icons and focus rings match.
// eslint-disable-next-line react-refresh/only-export-components
export const headerIconTriggerClass = (active = false) =>
  `relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${active
    ? 'bg-background-tertiary text-text-primary'
    : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
  }`;

// Shared compact counter badge for header utility icons (inbox, cart).
export const HEADER_COUNT_BADGE_CLASS =
  'absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-background-primary bg-primary px-1 text-xs font-medium leading-none tabular-nums text-text-inverse';

const HeaderIconButton = ({ to, icon: Icon, badge = 0, onClick, title }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      aria-label={title}
      title={title}
      aria-current={isActive ? 'page' : undefined}
      className={headerIconTriggerClass(isActive)}
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      {badge > 0 && (
        <span className={HEADER_COUNT_BADGE_CLASS}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
};

export default HeaderIconButton;
