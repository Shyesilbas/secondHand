const VARIANTS = {
 primary: 'bg-primary text-white hover:bg-primary-hover',
 secondary: 'border border-border bg-background-primary text-text-primary hover:border-card-border-hover hover:bg-background-secondary',
 ghost: 'text-text-secondary hover:bg-background-secondary hover:text-text-primary',
 danger: 'text-status-error-text hover:bg-background-secondary',
};

const SIZES = {
 sm: 'h-9 px-3',
 md: 'h-10 px-4',
};

// Shared with links that look like buttons (e.g. <Link className={buttonClasses()} />).
// eslint-disable-next-line react-refresh/only-export-components
export const buttonClasses = (variant = 'primary', size = 'md') =>
 `inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]}`;

const Button = ({ variant = 'primary', size = 'md', type = 'button', className = '', ...props }) => (
 <button type={type} className={`${buttonClasses(variant, size)} ${className}`} {...props} />
);

export default Button;
