import React, { useState } from 'react';

const SidebarLayout = ({
                           sidebarContent,
                           mainContent,
                           sidebarTitle = "Filters",
                           sidebarWidth = "w-80"
                       }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop sidebar

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex lg:flex-col bg-white border-r border-gray-200 sticky top-0 h-screen transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? 'w-16' : sidebarWidth
            }`}>
                {/* Sidebar Header */}
                <div className={`flex-shrink-0 border-b border-gray-200 transition-all duration-300 ${
                    isSidebarCollapsed ? 'px-3 py-4' : 'px-6 py-5'
                }`}>
                    <div className="flex items-center justify-between">
                        {!isSidebarCollapsed && (
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{sidebarTitle}</h2>
                                <p className="text-sm text-gray-600 mt-0.5">Refine your search</p>
                            </div>
                        )}
                        <button
                            onClick={toggleSidebarCollapse}
                            className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 ${
                                isSidebarCollapsed ? 'mx-auto' : ''
                            }`}
                            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
                    isSidebarCollapsed ? 'px-3 py-4' : 'p-6'
                }`}>
                    {isSidebarCollapsed ? (
                        <div className="space-y-4">
                            {/* Collapsed Icons */}
                            <div className="group relative">
                                <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                </div>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Filters
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h2v2H7v2z" />
                                    </svg>
                                </div>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Categories
                                </div>
                            </div>

                            <div className="group relative">
                                <div className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer transition-colors">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Price Range
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sidebarContent}
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={toggleSidebar}
                    ></div>

                    <aside className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
                        {/* Mobile Header */}
                        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-gray-200">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">{sidebarTitle}</h2>
                                <p className="text-sm text-gray-600 mt-0.5">Refine your search</p>
                            </div>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Mobile Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                {sidebarContent}
                            </div>
                        </div>

                        {/* Mobile Footer Actions */}
                        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex space-x-3">
                                <button
                                    onClick={toggleSidebar}
                                    className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Apply Filters
                                </button>
                                <button className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    Clear All
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 bg-white">
                {/* Mobile Filter Button */}
                <div className="lg:hidden bg-white border-b border-gray-200 p-4">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors group"
                    >
                        <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                            Filters & Categories
                        </span>
                        <svg className="w-4 h-4 text-gray-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Floating Expand Button (when collapsed) */}
                {isSidebarCollapsed && (
                    <div className="hidden lg:block fixed top-6 left-6 z-20">
                        <button
                            onClick={toggleSidebarCollapse}
                            className="p-3 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 transition-all duration-200 group"
                            title="Expand filters"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Main Content */}
                <div className="h-full">
                    {mainContent}
                </div>
            </main>
        </div>
    );
};

// Enhanced Filter Components for better spacing
export const FilterSection = ({ title, children, collapsible = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                {collapsible && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>
            {isExpanded && (
                <div className="space-y-2">
                    {children}
                </div>
            )}
        </div>
    );
};

export const FilterCheckbox = ({ label, count, checked, onChange }) => (
    <label className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
        <div className="flex items-center space-x-3">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 text-gray-900 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 focus:ring-1"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
        </div>
        {count !== undefined && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {count}
            </span>
        )}
    </label>
);

export const FilterRange = ({ label, min, max, value, onChange }) => (
    <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="px-2">
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={onChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>${min}</span>
                <span className="font-medium text-gray-700">${value}</span>
                <span>${max}</span>
            </div>
        </div>
    </div>
);

export const FilterButton = ({ children, active = false, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
            active
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
        }`}
    >
        {children}
    </button>
);

export default SidebarLayout;