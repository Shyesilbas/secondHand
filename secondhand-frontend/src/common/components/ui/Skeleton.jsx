const Skeleton = ({ className = '' }) => (
 <div className={`animate-pulse bg-background-tertiary rounded ${className}`} />
);

// Mirrors ListingCard geometry (4:3 image, price, two title lines, meta) so grids do not jump on load.
export const SkeletonCard = () => (
 <div className="overflow-hidden rounded border border-border-light bg-background-primary">
 <Skeleton className="aspect-4/3 w-full rounded-none" />
 <div className="space-y-2 p-3 sm:p-4">
 <Skeleton className="h-6 w-1/2" />
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-2/3" />
 <Skeleton className="h-4 w-1/3" />
 </div>
 </div>
);

export const SkeletonList = () => (
 <div className="bg-background-primary border border-border-light rounded p-4 space-y-3">
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

export const SkeletonGrid = ({ count = 4, columns = 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4', gap = 'gap-4' }) => (
 <div className={`grid ${columns} ${gap}`}>
 {Array.from({ length: count }).map((_, i) => (
 <SkeletonCard key={`skeleton-card-${i}`} />
 ))}
 </div>
);

export default Skeleton;
