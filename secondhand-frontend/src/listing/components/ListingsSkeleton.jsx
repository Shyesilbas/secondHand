
const ListingsSkeleton = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
                <div key={'skeleton-' + index} className="bg-background-primary rounded-lg border border-border-light shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-tertiary"></div>
                    <div className="p-4 space-y-3">
                        <div className="h-4 bg-tertiary rounded w-3/4"></div>
                        <div className="h-3 bg-tertiary rounded w-1/2"></div>
                        <div className="h-3 bg-tertiary rounded w-2/3"></div>
                        <div className="flex items-center justify-between">
                            <div className="h-6 bg-tertiary rounded w-20"></div>
                            <div className="h-4 bg-tertiary rounded w-16"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ListingsSkeleton;
