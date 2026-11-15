const VARIANT_CLASSES = {
  neutral: 'border-border bg-background-secondary text-text-secondary',
  muted: 'border-border-light bg-background-tertiary text-text-secondary',
  success: 'border-status-success-border bg-status-success-bg text-status-success-text',
  warning: 'border-status-warning-border bg-status-warning-bg text-status-warning-text',
  error: 'border-status-error-border bg-status-error-bg text-status-error-text',
  primary: 'border-border bg-primary-light text-primary',
};

const DOT_CLASSES = {
  neutral: 'bg-text-tertiary',
  muted: 'bg-text-tertiary',
  success: 'bg-status-success',
  warning: 'bg-status-warning',
  error: 'bg-status-error',
  primary: 'bg-primary',
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-0.5 text-xs',
};

// eslint-disable-next-line react-refresh/only-export-components
export const badgeClasses = ({ variant = 'neutral', size = 'md', className = '' } = {}) =>
  `inline-flex items-center gap-1.5 rounded-sm border font-medium leading-tight tabular-nums ${
    SIZE_CLASSES[size] || SIZE_CLASSES.md
  } ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral} ${className}`.trim();

const Badge = ({
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon: Icon,
  as: Component = 'span',
  className = '',
  children,
  ...rest
}) => (
  <Component className={badgeClasses({ variant, size, className })} {...rest}>
    {dot && (
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_CLASSES[variant] || DOT_CLASSES.neutral}`}
        aria-hidden
      />
    )}
    {Icon && <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} aria-hidden />}
    {children}
  </Component>
);

export default Badge;
