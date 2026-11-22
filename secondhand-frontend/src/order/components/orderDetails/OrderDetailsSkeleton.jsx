import { Card, Skeleton } from '../../../common/components/ui/index.js';

export const OrderDetailsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Top Stepper Banner */}
      <div className="space-y-3 rounded bg-background-secondary p-4">
        <div className="grid grid-cols-5 gap-2 py-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border-light pt-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Two Column Layout: 7 / 5 grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-7">
          {/* Items Card */}
          <Card shadow={false} className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="divide-y divide-border-light">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <Skeleton className="h-16 w-16 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-16 shrink-0" />
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping / Address Card */}
          <Card shadow={false} className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:col-span-5">
          {/* Payment Card */}
          <Card shadow={false} className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-1/3" />
              </div>
              <div className="flex justify-between border-t border-border-light pt-4">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
