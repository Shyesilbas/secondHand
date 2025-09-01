import React from 'react';

export const SkeletonLine = ({ width = 'w-full', height = 'h-4', className = '' }) => (
  <div className={`bg-gray-200 rounded ${width} ${height} animate-pulse ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
    <div className="flex h-32">
      <div className="w-48 bg-gray-200 flex-shrink-0"></div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <SkeletonLine width="w-24" />
            <SkeletonLine width="w-20" height="h-6" />
          </div>
          <SkeletonLine width="w-3/4" height="h-5" className="mb-2" />
          <SkeletonLine />
        </div>
        <div className="flex justify-between items-center">
          <SkeletonLine width="w-32" />
          <SkeletonLine width="w-16" />
        </div>
      </div>
    </div>
  </div>
);

