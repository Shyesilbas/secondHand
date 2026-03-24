
import DataPagination from '../../common/components/ui/DataPagination.jsx';
import { PAGE_SIZE_OPTIONS_5_10_20_50 } from '../../common/constants/pagination.js';

const PaginationControls = ({
  shouldShowPagination,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalElements,
  pageSize,
  goToPreviousPage,
  goToNextPage,
  changePageSize,
}) => (
  <DataPagination
    shouldShowPagination={shouldShowPagination}
    currentPage={currentPage}
    totalPages={totalPages}
    startItem={startIndex}
    endItem={endIndex}
    totalItems={totalElements}
    pageSize={pageSize}
    pageSizeOptions={PAGE_SIZE_OPTIONS_5_10_20_50}
    onPageChange={(nextPage) => {
      if (nextPage < currentPage) goToPreviousPage();
      else if (nextPage > currentPage) goToNextPage();
    }}
    onPageSizeChange={changePageSize}
  />
);

export default PaginationControls;
