const Skeleton = ({ className = '' }) => (
 <div className={`animate-pulse bg-secondary-200 rounded ${className}`} />
);

// Mirrors ListingCard geometry (4:3 image, price, two title lines, meta) so grids do not jump on load.
export const SkeletonCard = () => (
 <div className="flex h-full flex-col overflow-hidden rounded border border-border-light bg-background-primary shadow-sm">
 <Skeleton className="aspect-4/3 w-full shrink-0 rounded-none border-b border-border-light" />
 <div className="flex flex-1 flex-col gap-1 p-3.5">
 {/* price (text-lg line), two-line title (min-h-11), meta row with the 32px favorite button */}
 <Skeleton className="h-7 w-1/2" />
 <div className="min-h-11 space-y-2 pt-1">
 <Skeleton className="h-4 w-full" />
 <Skeleton className="h-4 w-2/3" />
 </div>
 <div className="mt-auto flex items-center justify-between gap-2 pt-2">
 <Skeleton className="h-4 w-1/3" />
 <Skeleton className="h-8 w-8" />
 </div>
 </div>
 </div>
);

export const SkeletonList = () => (
 <div className="bg-background-primary border border-border-light rounded p-4 space-y-3 shadow-sm">
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
