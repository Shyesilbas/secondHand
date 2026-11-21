import { useRef } from 'react';

const UNDERLINE_TAB =
  '-mb-px inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50';

const SEGMENTED_TAB =
  'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-50';

/**
 * Shared accessible tab bar with roving tabindex, arrow-key navigation and scroll-into-view.
 * Note: keep navigation links as <a>/<Link> rather than ARIA tabs.
 */
const Tabs = ({
  items = [],
  activeKey,
  onChange,
  ariaLabel,
  ariaLabelledBy,
  variant = 'underline',
  fullWidth = false,
  className = '',
  tabClassName = '',
  borderBottom = true,
}) => {
  const buttonRefs = useRef([]);
  const enabledIndices = items
    .map((item, idx) => (item.disabled ? -1 : idx))
    .filter((idx) => idx !== -1);

  const selectedIndex = items.findIndex((item) => (item.key ?? item.id) === activeKey);
  const focusableFallbackIndex = enabledIndices[0] ?? 0;

  const selectByIndex = (nextIndex) => {
    const item = items[nextIndex];
    if (!item || item.disabled) return;
    const key = item.key ?? item.id;
    onChange?.(key);
    const el = buttonRefs.current[nextIndex];
    if (el) {
      el.focus();
      el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
  };

  const handleKeyDown = (e, currentIdx) => {
    if (enabledIndices.length === 0) return;
    const pos = enabledIndices.indexOf(currentIdx);
    if (pos === -1) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      selectByIndex(enabledIndices[(pos + 1) % enabledIndices.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      selectByIndex(enabledIndices[(pos - 1 + enabledIndices.length) % enabledIndices.length]);
    } else if (e.key === 'Home') {
      e.preventDefault();
      selectByIndex(enabledIndices[0]);
    } else if (e.key === 'End') {
      e.preventDefault();
      selectByIndex(enabledIndices[enabledIndices.length - 1]);
    }
  };

  const isSegmented = variant === 'segmented';
  const containerClass = isSegmented
    ? `inline-flex max-w-full overflow-x-auto items-center gap-1 rounded border border-border bg-background-secondary p-1 ${fullWidth ? 'flex w-full' : ''} ${className}`.trim()
    : `flex overflow-x-auto ${borderBottom ? 'border-b border-border-light' : ''} ${className}`.trim();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={containerClass}
    >
      {items.map((item, idx) => {
        const key = item.key ?? item.id;
        const active = activeKey != null && activeKey === key;
        const Icon = item.icon;
        const count = item.count;
        const widthClass = fullWidth ? 'flex-1 justify-center' : '';

        const stateClass = isSegmented
          ? active
            ? 'bg-background-primary text-text-primary shadow-sm'
            : 'text-text-secondary hover:text-text-primary'
          : active
            ? 'border-primary text-text-primary'
            : 'border-transparent text-text-secondary hover:text-text-primary';

        const tabBase = isSegmented ? SEGMENTED_TAB : UNDERLINE_TAB;
        const tabIndex = active
          ? 0
          : selectedIndex === -1 && idx === focusableFallbackIndex
            ? 0
            : -1;

        return (
          <button
            key={key}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            id={item.id}
            aria-selected={active}
            tabIndex={tabIndex}
            disabled={Boolean(item.disabled)}
            onClick={() => {
              onChange?.(key);
              buttonRefs.current[idx]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
            }}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`${tabBase} ${widthClass} ${stateClass} ${tabClassName}`.trim()}
          >
            {Icon && (
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? 'text-text-primary' : 'text-text-muted'}`}
                strokeWidth={1.5}
                aria-hidden
              />
            )}
            <span>{item.label}</span>
            {count != null && (!item.hideZeroCount || count > 0) && (
              <span
                className={`rounded-sm px-1.5 text-xs font-medium tabular-nums ${
                  item.highlight
                    ? 'bg-status-warning-bg text-status-warning-text'
                    : isSegmented && active
                      ? 'bg-primary text-text-inverse'
                      : 'bg-background-tertiary text-text-secondary'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
