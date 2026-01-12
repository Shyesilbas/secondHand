import React, { useState, useEffect, useCallback } from "react";
import { useEnums } from "../../common/hooks/useEnums.js";
import { X } from "lucide-react";
import CategorySelector from "./CategorySelector.jsx";

const LISTING_STATUSES = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'SOLD', label: 'Sold' },
    { value: 'RESERVED', label: 'Reserved' },
];

const MyListingsFilterSidebar = ({
    isOpen,
    onClose,
    selectedCategory,
    selectedStatus,
    onCategoryChange,
    onStatusChange,
    onReset,
}) => {
    const { enums, isLoading: enumsLoading } = useEnums();
    const [localCategory, setLocalCategory] = useState(selectedCategory);
    const [localStatus, setLocalStatus] = useState(selectedStatus);

    useEffect(() => {
        setLocalCategory(selectedCategory);
        setLocalStatus(selectedStatus);
    }, [selectedCategory, selectedStatus]);

    const handleCategoryChange = useCallback((category) => {
        setLocalCategory(category);
        onCategoryChange(category);
    }, [onCategoryChange]);

    const handleStatusChange = useCallback((status) => {
        const newStatus = status === localStatus ? null : status;
        setLocalStatus(newStatus);
        onStatusChange(newStatus);
    }, [localStatus, onStatusChange]);

    const handleReset = useCallback(() => {
        setLocalCategory(null);
        setLocalStatus(null);
        onReset();
    }, [onReset]);

    if (enumsLoading) {
        return (
            <div className="fixed inset-0 z-50 lg:relative lg:z-auto">
                <div className="fixed inset-0 bg-black/50 lg:hidden" onClick={onClose} />
                <div className="fixed left-0 top-0 h-screen w-80 bg-white shadow-xl lg:relative lg:shadow-none border-r border-gray-200 overflow-y-auto">
                    <div className="flex items-center justify-center h-full">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}
            <div className={`
                fixed left-0 top-0 h-screen w-80 bg-white shadow-xl z-50 border-r border-gray-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="border-b border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 overscroll-contain">
                    <div className="p-4 space-y-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <CategorySelector
                                selectedCategory={localCategory}
                                onCategoryChange={handleCategoryChange}
                                compact={true}
                            />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleStatusChange(null)}
                                    className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                        localStatus === null
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">All Statuses</span>
                                        {localStatus === null && (
                                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                        )}
                                    </div>
                                </button>
                                {LISTING_STATUSES.map((status) => (
                                    <button
                                        key={status.value}
                                        onClick={() => handleStatusChange(status.value)}
                                        className={`w-full p-2.5 rounded-lg border transition-all duration-200 text-left ${
                                            localStatus === status.value
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{status.label}</span>
                                            {localStatus === status.value && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleReset}
                            className="w-full px-3 py-2 text-gray-600 text-sm font-medium hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyListingsFilterSidebar;

