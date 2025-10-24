import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const SecuritySummary = ({ totalElements, auditLogs }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Events</p>
                        <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Successful Logins</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {auditLogs.filter(log => log.eventType === 'LOGIN_SUCCESS').length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Failed Attempts</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {auditLogs.filter(log => log.eventType === 'LOGIN_FAILURE').length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySummary;
