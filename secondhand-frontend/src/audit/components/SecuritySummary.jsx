import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SecuritySummary = ({ totalElements, auditLogs }) => {
    const successfulLogins = auditLogs.filter(log => log.eventType === 'LOGIN_SUCCESS').length;
    const failedAttempts = auditLogs.filter(log => log.eventType === 'LOGIN_FAILURE').length;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Total Events</p>
                        <p className="text-3xl font-bold text-gray-900">{totalElements}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Successful Logins</p>
                        <p className="text-3xl font-bold text-gray-900">{successfulLogins}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Failed Attempts</p>
                        <p className="text-3xl font-bold text-gray-900">{failedAttempts}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySummary;
