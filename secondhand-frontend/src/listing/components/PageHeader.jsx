import React from 'react';
import { Link } from 'react-router-dom';

const PageHeader = ({ title, subtitle, onRefresh, createButtonText, createButtonRoute }) => {
    return (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">
                    {title}
                </h1>
                <p className="text-text-secondary mt-2">
                    {subtitle}
                </p>
            </div>
            <div className="flex items-center space-x-4">
                {onRefresh && (
                    <button
                        onClick={onRefresh}
                        className="text-text-secondary hover:text-text-primary transition-colors"
                        title="Refresh"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                )}
                {createButtonText && createButtonRoute && (
                    <Link
                        to={createButtonRoute}
                        className="bg-btn-primary text-white px-4 py-2 rounded-lg hover:bg-btn-primary-hover transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>{createButtonText}</span>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
