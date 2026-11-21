import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

const SIZES = {
  sm: 'text-base',
  md: 'text-xl',
};

const TONES = {
  // Light surfaces: ink wordmark, accent on the second half.
  default: { base: 'text-text-primary', accent: 'text-accent-teal' },
  // Dark surfaces (footer): white wordmark, the lighter teal keeps contrast on bg-primary.
  inverse: { base: 'text-white', accent: 'text-accent-teal-400' },
};

/**
 * The one brand mark (header, footer, auth). A wordmark only: no product icon stands in for the logo.
 * Renders as a home link unless `asLink` is false.
 */
const BrandMark = ({ size = 'md', tone = 'default', asLink = true, className = '' }) => {
  const palette = TONES[tone] ?? TONES.default;
  const content = (
    <span className={`font-semibold tracking-tight ${SIZES[size] ?? SIZES.md} ${palette.base}`}>
      second<span className={palette.accent}>Hand</span>
    </span>
  );

  if (!asLink) return <span className={`inline-flex items-center ${className}`.trim()}>{content}</span>;

  return (
    <Link
      to={ROUTES.HOME}
      aria-label="secondHand"
      className={`inline-flex shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 ${className}`.trim()}
    >
      {content}
    </Link>
  );
};

export default BrandMark;
