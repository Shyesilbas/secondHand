import { useTranslation } from "react-i18next";
import Button from './Button.jsx';
const DataPagination = ({
 shouldShowPagination,
 currentPage,
 totalPages,
 startItem,
 endItem,
 totalItems,
 pageSize,
 pageSizeOptions,
 onPageChange,
 onPageSizeChange
}) => {
 const {
 t
 } = useTranslation();
 if (!shouldShowPagination || totalPages <= 1) return null;
 return <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-light pt-4">
 <div className="flex items-center space-x-2">
 <Button variant="secondary" size="sm" onClick={() => onPageChange(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>{t("previous")}</Button>

 <span className="text-sm text-text-tertiary tabular-nums">{t("page")} {currentPage + 1} / {totalPages}
 </span>

 <Button variant="secondary" size="sm" onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>{t("next")}</Button>
 </div>

 <div className="flex items-center space-x-4">
 <div className="text-sm text-text-tertiary tabular-nums">{t("showing")}: {startItem}-{endItem} / {totalItems} {t("results")}</div>

 <div className="flex items-center space-x-2">
 <label htmlFor="pageSize" className="text-sm text-text-tertiary">{t("per_page")}</label>
 <select id="pageSize" className="h-9 rounded border border-border bg-background-primary px-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-border-focus" value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
 {(pageSizeOptions ?? []).map(size => <option key={size} value={size}>
 {size}
 </option>)}
 </select>
 </div>
 </div>
 </div>;
};
export default DataPagination;