import {Search as MagnifyingGlassIcon} from 'lucide-react';
import Button from './Button.jsx';

const EmptyState = ({
 icon: Icon,
 title = 'Nothing Found',
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
 <DefaultIcon className="mx-auto mb-4 h-5 w-5 text-text-muted" strokeWidth={1.5} aria-hidden />
 )}
 <h3 className="mb-2 text-sm font-medium text-text-primary">{title}</h3>
 {description && (
 <p className={`text-sm text-text-secondary ${isCompact ? 'mb-4' : 'mb-6'}`}>{description}</p>
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

