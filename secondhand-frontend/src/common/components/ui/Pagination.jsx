import { useTranslation } from "react-i18next";
import Button from './Button.jsx';

const Pagination = ({
  page,
  totalPages,
  onPageChange,
  className = ''
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("pagination", "Pagination")}
      className={`flex items-center justify-between gap-4 px-3 py-2 ${className}`}
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label={t("previous_page", "Previous page")}
      >
        {t("previous", "Previous")}
      </Button>

      <span className="text-sm font-medium text-text-secondary tabular-nums select-none whitespace-nowrap px-2">
        {t("page", "Page")} <span className="font-semibold text-text-primary">{page + 1}</span> / {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages - 1}
        aria-label={t("next_page", "Next page")}
      >
        {t("next", "Next")}
      </Button>
    </nav>
  );
};

export default Pagination;
