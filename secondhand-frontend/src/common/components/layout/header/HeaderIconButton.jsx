import { Link } from 'react-router-dom';

const HeaderIconButton = ({ to, icon: Icon, badge = 0, onClick, title }) => (
 <Link
 to={to}
 onClick={onClick}
 title={title}
 className="group relative p-2 text-text-secondary hover:text-text-primary transition-all duration-200 rounded hover:bg-tertiary"
 >
 <Icon className="w-4 h-4 stroke-1.5" />
 {badge > 0 && (
 <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4 h-4 px-1 text-xs font-semibold text-white bg-status-error rounded-sm border border-white shadow-sm">
 {badge > 99 ? '99+' : badge}
 </span>
 )}
 </Link>
);

export default HeaderIconButton;
