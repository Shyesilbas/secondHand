import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PageContainer from '../../common/components/layout/PageContainer.jsx';
import { SkeletonGrid } from '../../common/components/ui/Skeleton.jsx';
import { HOME_GRID_COLUMNS, HOME_GRID_SIZE } from './homeLayout.js';


/** Home page section: title, optional one-line description, optional "see all" link. */
const HomeSection = ({ title, description, linkTo, linkLabel, children }) => (
  <section>
    <PageContainer>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">{title}</h2>
          {description && <p className="mt-1 text-sm text-text-secondary">{description}</p>}
        </div>
        {linkTo && (
          <Link
            to={linkTo}
            className="inline-flex shrink-0 items-center gap-1 text-sm text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            {linkLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          </Link>
        )}
      </div>
      {children}
    </PageContainer>
  </section>
);

HomeSection.Skeleton = function HomeGridSkeleton() {
  return <SkeletonGrid count={HOME_GRID_SIZE} columns={HOME_GRID_COLUMNS} />;
};

export default HomeSection;
