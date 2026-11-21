const PADDING_CLASSES = {
  compact: 'p-4',
  normal: 'p-5',
  none: '',
};

const SURFACE_CLASSES = {
  primary: 'bg-background-primary',
  secondary: 'bg-background-secondary',
};

// Cards sit on the page canvas and separate by tone and shadow, so the default edge is light.
// 'strong' is for cards that sit on white (inside another surface) without a shadow.
const BORDER_CLASSES = {
  default: 'border-border-light',
  light: 'border-border-light',
  strong: 'border-border',
};

const Card = ({
  as: Component = 'div',
  padding = 'normal',
  surface = 'primary',
  border = 'default',
  shadow = true,
  interactive = false,
  className = '',
  children,
  ...rest
}) => {
  const paddingClass = PADDING_CLASSES[padding] ?? PADDING_CLASSES.normal;
  const surfaceClass = SURFACE_CLASSES[surface] ?? SURFACE_CLASSES.primary;
  const borderClass = BORDER_CLASSES[border] ?? BORDER_CLASSES.default;
  const shadowClass = shadow ? 'shadow-sm' : '';
  const interactiveClass = interactive
    ? 'transition duration-150 hover:border-border hover:shadow-md'
    : '';

  return (
    <Component
      className={`rounded border ${borderClass} ${surfaceClass} ${paddingClass} ${shadowClass} ${interactiveClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Card;
