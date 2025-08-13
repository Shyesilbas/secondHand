import React from 'react';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({ title, subtitle, showBack = true, right = null }) => {
  const navigate = useNavigate();
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-slate-600 mt-1">{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  );
};

export default PageHeader;

