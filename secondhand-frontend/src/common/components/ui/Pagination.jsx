import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const STEP = 'inline-flex h-9 items-center justify-center gap-1 rounded text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:cursor-not-allowed disabled:opacity-40';
const EDGE = `${STEP} border border-border bg-background-primary px-3 text-text-primary hover:border-card-border-hover hover:bg-background-secondary disabled:hover:border-border disabled:hover:bg-background-primary`;
const ICON = `${STEP} w-9 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary disabled:hover:border-border disabled:hover:bg-background-primary`;
const NUMBER = `${STEP} min-w-9 px-2 tabular-nums`;
const NUMBER_IDLE = 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary';
const NUMBER_ACTIVE = 'border border-accent-teal bg-accent-teal-50 text-accent-teal-800';

// First, last and the current page with one neighbour each side; gaps become an ellipsis.
// 0-based pages in, display items out: numbers or 'gap'.
const pageItems = (page, totalPages) => {
  const pages = new Set([0, totalPages - 1, page - 1, page, page + 1]);
  // Close a single-page gap instead of showing "1 ... 3".
  if (page - 2 === 1) pages.add(1);
  if (page + 2 === totalPages - 2) pages.add(totalPages - 2);
  const sorted = [...pages].filter(p => p >= 0 && p < totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap', p] : [p]));
};

/**
 * Page navigation. `full` (default) shows numbered pages from `sm` up and "x / y" on phones;
 * `compact` is a small "Page x / y" with arrows for the top of long lists.
 */
const Pagination = ({
  page,
  totalPages,
  onPageChange,
  variant = 'full',
  className = ''
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const isFirst = page <= 0;
  const isLast = page >= totalPages - 1;
  const go = (target) => {
    if (target !== page && target >= 0 && target < totalPages) onPageChange(target);
  };
  const counter = (
    <span className="whitespace-nowrap text-sm tabular-nums text-text-secondary">
      <span className="font-medium text-text-primary">{page + 1}</span> / {totalPages}
    </span>
  );

  if (variant === 'compact') {
    return (
      <nav aria-label={t("pagination", "Sayfalama")} className={`flex items-center gap-2 ${className}`}>
        <span className="hidden text-sm text-text-tertiary sm:inline">{t("page", "Sayfa")}</span>
        {counter}
        <div className="flex items-center gap-1">
          <button type="button" className={ICON} onClick={() => go(page - 1)} disabled={isFirst} aria-label={t("previous_page", "Önceki sayfa")}>
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
          <button type="button" className={ICON} onClick={() => go(page + 1)} disabled={isLast} aria-label={t("next_page", "Sonraki sayfa")}>
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav aria-label={t("pagination", "Sayfalama")} className={`flex items-center justify-center gap-2 ${className}`}>
      <button type="button" className={EDGE} onClick={() => go(page - 1)} disabled={isFirst} aria-label={t("previous_page", "Önceki sayfa")}>
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        <span className="hidden sm:inline">{t("previous", "Önceki")}</span>
      </button>

      <ol className="hidden items-center gap-1 sm:flex">
        {pageItems(page, totalPages).map((item, i) => (
          item === 'gap' ? (
            <li key={`gap-${i}`} className="w-6 text-center text-sm text-text-tertiary" aria-hidden>…</li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => go(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`${t("page", "Sayfa")} ${item + 1}`}
                className={`${NUMBER} ${item === page ? NUMBER_ACTIVE : NUMBER_IDLE}`}
              >
                {item + 1}
              </button>
            </li>
          )
        ))}
      </ol>
      <span className="px-2 sm:hidden">{counter}</span>

      <button type="button" className={EDGE} onClick={() => go(page + 1)} disabled={isLast} aria-label={t("next_page", "Sonraki sayfa")}>
        <span className="hidden sm:inline">{t("next", "Sonraki")}</span>
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      </button>
    </nav>
  );
};

export default Pagination;
