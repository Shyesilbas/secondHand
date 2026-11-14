import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
import { LISTING_GRID_COLUMNS, LISTING_GRID_GAP } from './ListingGrid.jsx';

// Same columns and gap as ListingGrid, so results replace the placeholders in place.
const ListingsSkeleton = () => (
  <SkeletonGrid count={10} columns={LISTING_GRID_COLUMNS} gap={LISTING_GRID_GAP} />
);

export default ListingsSkeleton;
