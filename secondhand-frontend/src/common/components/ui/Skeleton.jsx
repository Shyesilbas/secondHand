const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

export const SkeletonCard = () => (
  <div className="bg-background-primary border border-border-light rounded-xl p-4 space-y-3">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <div className="flex justify-between items-center pt-1">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

export const SkeletonList = () => (
  <div className="bg-background-primary border border-border-light rounded-xl p-4 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-4/5" />
  </div>
);

export const SkeletonText = ({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={`skeleton-text-${i}`}
        className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 4, columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' }) => (
  <div className={`grid ${columns} gap-4`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={`skeleton-card-${i}`} />
    ))}
  </div>
);

export default Skeleton;
