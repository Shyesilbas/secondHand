import { Link } from 'react-router-dom';

const HeaderIconButton = ({ to, icon: Icon, badge = 0, onClick, title }) => (
    <Link
        to={to}
        onClick={onClick}
        title={title}
        className="group relative p-2 text-text-muted hover:text-text-primary transition-all duration-200 rounded-lg hover:bg-tertiary"
    >
        <Icon className="w-[18px] h-[18px] stroke-[1.8px]" />
        {badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-status-error-bg rounded-full border-[1.5px] border-white shadow-sm">
                {badge > 99 ? '99+' : badge}
            </span>
        )}
    </Link>
);

export default HeaderIconButton;
