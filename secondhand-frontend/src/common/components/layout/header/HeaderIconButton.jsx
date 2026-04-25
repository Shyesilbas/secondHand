import { Link } from 'react-router-dom';

const HeaderIconButton = ({ to, icon: Icon, badge = 0, onClick, title }) => (
    <Link
        to={to}
        onClick={onClick}
        title={title}
        className="group relative p-2 text-gray-500 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-100"
    >
        <Icon className="w-[18px] h-[18px] stroke-[1.8px]" />
        {badge > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-red-500 rounded-full border-[1.5px] border-white shadow-sm">
                {badge > 99 ? '99+' : badge}
            </span>
        )}
    </Link>
);

export default HeaderIconButton;
