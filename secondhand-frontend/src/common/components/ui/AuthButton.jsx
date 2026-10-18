import { useTranslation } from "react-i18next";
const AuthButton = ({
 children,
 type = 'button',
 onClick,
 isLoading = false,
 disabled = false,
 variant = 'primary',
 size = 'md',
 leftIcon = null,
 rightIcon = null,
 className = ''
}) => {
 const {
 t
 } = useTranslation();
 const baseClasses = `
 w-full inline-flex items-center justify-center gap-2 border
 rounded font-medium focus:outline-none focus:ring-4 focus:ring-primary/5
 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
 text-sm
 `;
 const variants = {
 primary: `
 text-white bg-primary border-primary hover:bg-primary-hover
 disabled:bg-primary disabled:hover:bg-primary
 `,
 secondary: `
 text-text-primary bg-background-tertiary/80 border-transparent hover:bg-secondary-200/60
 `,
 outline: `
 text-text-primary bg-background-primary border-border hover:bg-background-secondary hover:border-card-border-hover
 `,
 ghost: `
 text-text-secondary bg-transparent border-transparent hover:bg-background-tertiary/60
 `
 };
 const sizes = {
 sm: 'py-2.5 px-4',
 md: 'py-3 px-5',
 lg: 'py-3.5 px-6'
 };
 return <button type={type} onClick={onClick} disabled={disabled || isLoading} className={`${baseClasses} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}>
 {isLoading ? <div className="flex items-center justify-center gap-2">
 <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
 <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
 </svg>
 <span>{t("processing")}</span>
 </div> : <>
 {leftIcon && <span className="shrink-0">{leftIcon}</span>}
 <span>{children}</span>
 {rightIcon && <span className="shrink-0">{rightIcon}</span>}
 </>}
 </button>;
};
export default AuthButton;