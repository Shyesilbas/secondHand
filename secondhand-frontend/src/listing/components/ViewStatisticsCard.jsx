import { Calendar, Eye, TrendingUp, Users } from 'lucide-react';

const ViewStatisticsCard = ({ viewStats, periodDays }) => {
  if (!viewStats) return null;

  const { totalViews, uniqueViews } = viewStats;
  const repeatViews = Math.max(0, (totalViews || 0) - (uniqueViews || 0));
  const engagementRate = uniqueViews > 0 ? Math.round((totalViews / uniqueViews) * 10) / 10 : 0;

  const stats = [
    {
      icon: Eye,
      label: 'Total Views',
      value: totalViews || 0,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      icon: Users,
      label: 'Unique Visitors',
      value: uniqueViews || 0,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: TrendingUp,
      label: 'Avg. Views/User',
      value: engagementRate,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm mb-5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700">View Statistics</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>Last {periodDays || 7} days</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 divide-x divide-slate-100">
        {stats.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="flex flex-col items-center justify-center py-4 px-2 gap-1.5">
            <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className={`text-xl font-black tracking-tight ${color}`}>{value}</span>
            <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">{label}</span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      {repeatViews > 0 && (
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/40">
          <p className="text-[11px] text-slate-400 text-center">
            <span className="font-semibold text-slate-600">{repeatViews}</span> repeat visit{repeatViews !== 1 ? 's' : ''} recorded
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewStatisticsCard;
