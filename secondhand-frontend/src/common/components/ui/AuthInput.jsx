
const AuthInput = ({
 label,
 type = 'text',
 name,
 value,
 onChange,
 placeholder,
 error,
 required = false,
 className = '',
 inputClassName = '',
 labelClassName = '',
 errorClassName = '',
 leftIcon = null,
 rightElement = null,
 ...rest
}) => {
 const hasLeftIcon = Boolean(leftIcon);
 const hasRightElement = Boolean(rightElement);

 return (
 <div className={`flex flex-col w-full ${className}`}>
 {label && (
 <label
 htmlFor={name}
 className={`block text-xs font-semibold text-text-tertiary mb-2 ${labelClassName}`}
 >
 {label} {required && <span className="text-status-error font-normal">*</span>}
 </label>
 )}
 <div className="relative w-full group">
 {hasLeftIcon && (
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-text-secondary transition-colors duration-200">
 {leftIcon}
 </div>
 )}
 <input
 id={name}
 name={name}
 type={type}
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 required={required}
 className={`appearance-none block w-full rounded text-sm font-normal text-text-primary
 placeholder-text-muted bg-background-tertiary/40 border border-border/60
 focus:bg-background-primary focus:border-primary focus:ring-4 focus:ring-primary/5
 transition-all duration-300 outline-none
 ${hasLeftIcon ? 'pl-10' : 'px-4'}
 ${hasRightElement ? 'pr-12' : 'pr-4'}
 py-3
 ${error
 ? 'border-border bg-background-secondary/30 focus:ring-status-error/10 focus:border-status-error'
 : ''
 }
 ${inputClassName}
 `}
 {...rest}
 />
 {hasRightElement && (
 <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
 {rightElement}
 </div>
 )}
 </div>
 {error && (
 <div className={`mt-2 p-3 rounded bg-background-secondary/50 border border-border text-xs text-status-error-text leading-normal flex items-start gap-2 animate-fade-in ${errorClassName}`}>
 <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
 </svg>
 <span>{error}</span>
 </div>
 )}
 </div>
 );
};

export default AuthInput;