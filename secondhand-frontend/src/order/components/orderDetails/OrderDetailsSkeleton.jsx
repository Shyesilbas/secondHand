import React from 'react';

const SkeletonLine = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-slate-200 animate-pulse rounded ${className}`} />
);

export const OrderDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner / Info */}
      <div className="p-6 bg-card-bg border border-border-light rounded-xl shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <SkeletonLine className="h-5 w-1/4" />
          <SkeletonLine className="h-6 w-20 rounded-full" />
        </div>
        <div className="flex gap-4">
          <SkeletonLine className="h-4 w-28" />
          <SkeletonLine className="h-4 w-36" />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Progress, Items, Address, Notes */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stepper Card */}
          <div className="p-6 bg-card-bg border border-border-light rounded-xl shadow-sm space-y-4">
            <SkeletonLine className="h-4 w-32" />
            <div className="flex justify-between items-center py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2 flex-1">
                  <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
                  <SkeletonLine className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Items Card */}
          <div className="p-6 bg-card-bg border border-border-light rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border-light pb-3">
              <SkeletonLine className="h-4 w-24" />
              <SkeletonLine className="h-4 w-12" />
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-border-light last:border-b-0">
                <div className="w-16 h-16 bg-slate-200 animate-pulse rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="h-4 w-1/2" />
                  <SkeletonLine className="h-3 w-1/4" />
                </div>
                <div className="w-16 text-right">
                  <SkeletonLine className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Address Card */}
          <div className="p-6 bg-card-bg border border-border-light rounded-xl shadow-sm space-y-3">
            <SkeletonLine className="h-4 w-32" />
            <div className="space-y-2">
              <SkeletonLine className="h-3 w-3/4" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
          </div>
        </div>

        {/* Right Column: Payment & Partner info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Payment Card */}
          <div className="p-6 bg-card-bg border border-border-light rounded-xl shadow-sm space-y-4">
            <SkeletonLine className="h-4 w-28" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <SkeletonLine className="h-3.5 w-1/3" />
                <SkeletonLine className="h-3.5 w-1/4" />
              </div>
              <div className="flex justify-between">
                <SkeletonLine className="h-3.5 w-1/2" />
                <SkeletonLine className="h-3.5 w-1/4" />
              </div>
              <div className="border-t border-border-light pt-3 flex justify-between">
                <SkeletonLine className="h-4.5 w-1/4" />
                <SkeletonLine className="h-4.5 w-1/3" />
              </div>
            </div>
          </div>

          {/* Member Card */}
          <div className="p-6 bg-card-bg border border-border-light rounded-xl shadow-sm space-y-3">
            <SkeletonLine className="h-4 w-20" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-2">
                <SkeletonLine className="h-4 w-1/2" />
                <SkeletonLine className="h-3 w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsSkeleton;
