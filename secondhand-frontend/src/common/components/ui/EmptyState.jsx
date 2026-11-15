import {Search as MagnifyingGlassIcon} from 'lucide-react';
import Button from './Button.jsx';

const EmptyState = ({
 icon: Icon,
 title = 'Nothing Found',
 titleAs: TitleTag = 'h3',
 description,
 primaryAction,
 variant = 'default',
 size = 'default',
 className = '',
 children
}) => {
 const isCompact = size === 'compact';
 const padding = isCompact ? 'p-6' : 'p-8';

 const DefaultIcon = Icon || MagnifyingGlassIcon;

 return (
 <div className={`bg-background-primary rounded border border-border ${padding} text-center ${className}`}>
 {(DefaultIcon || variant !== 'default') && (
 <div className="w-10 h-10 rounded-full bg-background-secondary border border-border flex items-center justify-center text-text-muted mx-auto mb-3">
 <DefaultIcon className="h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
 </div>
 )}
 <TitleTag className={`mb-2 font-semibold text-text-primary ${isCompact ? 'text-sm' : 'text-base'}`}>{title}</TitleTag>
 {description && (
 <p className={`text-sm text-text-secondary max-w-md mx-auto ${isCompact ? 'mb-4' : 'mb-6'}`}>{description}</p>
 )}
 {primaryAction && (
 <Button onClick={primaryAction.onClick} disabled={primaryAction.disabled}>
 {primaryAction.label}
 </Button>
 )}
 {children}
 </div>
 );
};

export default EmptyState;

