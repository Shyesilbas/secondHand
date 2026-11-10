
const SkeletonLine = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-background-tertiary animate-pulse rounded ${className}`} />
);

export const OrderDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Top Stepper Banner */}
      <div className="p-4 bg-background-secondary/50 border border-border rounded-md shadow-sm space-y-4">
        <div className="flex justify-between items-center py-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 flex-1">
              <div className="w-7 h-7 rounded-full bg-background-tertiary animate-pulse" />
              <SkeletonLine className="h-2.5 w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout: 7 / 5 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Items Card */}
          <div className="p-5 bg-background-primary border border-border rounded-md shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-border-light pb-3">
              <SkeletonLine className="h-4 w-28" />
              <SkeletonLine className="h-4 w-12" />
            </div>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-border-light last:border-b-0">
                <div className="w-16 h-16 bg-background-tertiary animate-pulse rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonLine className="h-4 w-3/4" />
                  <SkeletonLine className="h-3 w-1/3" />
                </div>
                <div className="w-16 text-right">
                  <SkeletonLine className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>

          {/* Address Card */}
          <div className="p-5 bg-background-primary border border-border rounded-md shadow-sm space-y-3">
            <SkeletonLine className="h-4 w-24" />
            <div className="space-y-2">
              <SkeletonLine className="h-3 w-3/4" />
              <SkeletonLine className="h-3 w-1/2" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Card */}
          <div className="p-5 bg-background-primary border border-border rounded-md shadow-sm space-y-4">
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
                <SkeletonLine className="h-5 w-1/4" />
                <SkeletonLine className="h-5 w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

