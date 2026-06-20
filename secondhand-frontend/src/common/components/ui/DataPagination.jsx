import { useTranslation } from "react-i18next";
import React from 'react';
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
  return <div className="mt-6 rounded-2xl border border-border-light/70 bg-background-primary p-3 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center space-x-2">
        <button onClick={() => onPageChange(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-border-light rounded-lg bg-background-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{t("previous")}</button>

        <span className="text-xs text-slate-500 tabular-nums">{t("page")}{currentPage + 1}{t("of")}{totalPages}
        </span>

        <button onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1} className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-border-light rounded-lg bg-background-primary hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{t("next")}</button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-xs text-slate-500 tabular-nums">{t("showing")}{startItem}{t("to")}{endItem}{t("of")}{totalItems}{t("results")}</div>

        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="text-xs text-slate-500">{t("per_page")}</label>
          <select id="pageSize" className="px-2 py-1 text-xs border border-border-light rounded-lg bg-background-primary focus:outline-none focus:ring-2 focus:ring-indigo-100" value={pageSize} onChange={e => onPageSizeChange(Number(e.target.value))}>
            {(pageSizeOptions ?? []).map(size => <option key={size} value={size}>
                {size}
              </option>)}
          </select>
        </div>
      </div>
    </div>;
};
export default DataPagination;