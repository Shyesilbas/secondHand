import { useTranslation } from "react-i18next";
import { Calendar, Eye, TrendingUp, Users } from 'lucide-react';
const ViewStatisticsCard = ({
 viewStats,
 periodDays
}) => {
 const {
 t
 } = useTranslation();
 if (!viewStats) return null;
 const {
 totalViews,
 uniqueViews
 } = viewStats;
 const repeatViews = Math.max(0, (totalViews || 0) - (uniqueViews || 0));
 const engagementRate = uniqueViews > 0 ? Math.round(totalViews / uniqueViews * 10) / 10 : 0;
 const stats = [{
 icon: Eye,
 label: 'Total Views',
 value: totalViews || 0,
 color: 'text-primary',
 bg: 'bg-background-tertiary'
 }, {
 icon: Users,
 label: 'Unique Visitors',
 value: uniqueViews || 0,
 color: 'text-status-success',
 bg: 'bg-background-secondary'
 }, {
 icon: TrendingUp,
 label: 'Avg. Views/User',
 value: engagementRate,
 color: 'text-status-warning',
 bg: 'bg-background-secondary'
 }];
 return <div className="rounded-md border border-border-light bg-background-primary overflow-hidden mb-5">
 {/* Header */}
 <div className="flex items-center justify-between px-4 py-3 border-b border-border-light bg-background-secondary/60">
 <div className="flex items-center gap-2">
 <Eye className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
 <span className="text-sm font-semibold text-text-secondary">{t("view_statistics")}</span>
 </div>
 <div className="flex items-center gap-1 text-xs text-text-muted">
 <Calendar className="w-3 h-3" />
 <span>{t("last")}{periodDays || 7}{t("days")}</span>
 </div>
 </div>

 {/* Stats grid */}
 <div className="grid grid-cols-3 divide-x divide-border-light">
 {stats.map(({
 icon: Icon,
 label,
 value,
 color,
 bg
 }) => <div key={label} className="flex flex-col items-center justify-center py-4 px-2 gap-1.5">
 <div className={`w-8 h-8 rounded ${bg} flex items-center justify-center`}>
 <Icon className={`w-4 h-4 ${color}`} />
 </div>
 <span className={`text-xl font-semibold tracking-tight ${color}`}>{value}</span>
 <span className="text-xs text-text-muted font-medium text-center leading-tight">{label}</span>
 </div>)}
 </div>

 {/* Footer note */}
 {repeatViews > 0 && <div className="px-4 py-2.5 border-t border-border-light bg-background-secondary/40">
 <p className="text-xs text-text-muted text-center">
 <span className="font-semibold text-text-secondary">{repeatViews}</span>{t("repeat_visit")}{repeatViews !== 1 ? 's' : ''}{t("recorded")}</p>
 </div>}
 </div>;
};
export default ViewStatisticsCard;