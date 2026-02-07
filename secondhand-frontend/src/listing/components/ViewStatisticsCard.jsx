import {Calendar, Eye, Users} from 'lucide-react';

const ViewStatisticsCard = ({ viewStats, periodDays }) => {
  if (!viewStats) {
    return null;
  }

  const { totalViews, uniqueViews } = viewStats;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="bg-blue-100 rounded-lg p-2.5">
          <Eye className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">View Statistics</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                On Last <span className="font-semibold text-gray-900">{periodDays || 7}</span> days
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
               By <span className="font-semibold text-gray-900">{uniqueViews || 0}</span> unique user(s)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                Viewed <span className="font-semibold text-gray-900">{totalViews || 0}</span> times
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStatisticsCard;

