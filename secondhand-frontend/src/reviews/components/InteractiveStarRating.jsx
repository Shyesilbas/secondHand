import { REVIEW_DEFAULTS, REVIEW_LIMITS } from '../reviewConstants.js';
import { StarIcon } from './StarIcon.jsx';

const VARIANTS = {
  form: { button: 'w-8 h-8 transition-colors', icon: 'h-full w-full' },
  modal: { button: 'w-10 h-10 transition-transform hover:scale-110 focus:outline-none focus:scale-110', icon: 'h-full w-full' },
};

/**
 * Clickable star selection.
 * allowDeselect: reset when the same star is clicked again (modal behavior).
 */
export function InteractiveStarRating({
  value,
  onChange,
  variant = 'form',
  allowDeselect = false,
  className = 'gap-1',
}) {
  const { button, icon } = VARIANTS[variant] ?? VARIANTS.form;

  return (
    <div className={`flex items-center ${className}`}>
      {Array.from({ length: REVIEW_LIMITS.MAX_RATING }, (_, index) => {
        const starNumber = index + 1;
        const active = starNumber <= value;

        const handleClick = () => {
          if (allowDeselect && value === starNumber) {
            onChange(REVIEW_DEFAULTS.INITIAL_RATING);
          } else {
            onChange(starNumber);
          }
        };

        return (
          <button
            key={index}
            type="button"
            onClick={handleClick}
            className={`${button} ${active ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`}
          >
            <StarIcon className={icon} />
          </button>
        );
      })}
    </div>
  );
}
