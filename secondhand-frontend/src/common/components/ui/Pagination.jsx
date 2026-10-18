import { useTranslation } from "react-i18next";
const Pagination = ({
 page,
 totalPages,
 onPageChange
}) => {
 const {
 t
 } = useTranslation();
 if (totalPages <= 1) return null;
 return <div className="p-4 border-t border-sidebar-border">
 <div className="flex justify-between items-center">
 <button onClick={() => onPageChange(page - 1)} disabled={page === 0} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3">{t("previous")}</button>
 <span className="text-sm text-text-secondary">{t("page")}{page + 1} / {totalPages}
 </span>
 <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages - 1} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary h-9 px-3">{t("next")}</button>
 </div>
 </div>;
};
export default Pagination;