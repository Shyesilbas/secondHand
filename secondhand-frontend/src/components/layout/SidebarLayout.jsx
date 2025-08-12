import React, { useState } from 'react';

const SidebarLayout = ({ 
    sidebarContent, 
    mainContent, 
    sidebarTitle = "Filters",
    sidebarWidth = "w-80" 
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex lg:flex-col ${sidebarWidth} bg-white border-r border-gray-200 shadow-sm sticky top-0 h-screen`}>
                <div className="flex-shrink-0 px-6 py-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">{sidebarTitle}</h2>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {sidebarContent}
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={toggleSidebar}
                    ></div>
                    
                    {/* Sidebar */}
                    <aside className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col">
                        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">{sidebarTitle}</h2>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            {sidebarContent}
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-0">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
                    <button
                        onClick={toggleSidebar}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="text-sm font-medium">Filters & Categories</span>
                    </button>
                </div>

                {/* Main Content */}
                <div className="h-full">
                    {mainContent}
                </div>
            </main>
        </div>
    );
};

export default SidebarLayout;