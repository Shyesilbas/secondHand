import { Link } from 'react-router-dom';

const HeaderIconButton = ({ to, icon: Icon, badge = 0, onClick, title }) => (
    <Link
        to={to}
        onClick={onClick}
        title={title}
        className="group relative p-2.5 text-slate-600 hover:text-slate-900 transition-all duration-300 ease-in-out rounded-xl hover:bg-slate-100/50"
    >
        <Icon className="w-[20px] h-[20px] stroke-[1.5px]" />
        {badge > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1.5 text-[10px] font-semibold text-white bg-red-500 rounded-full border-2 border-white shadow-sm shadow-red-500/30">
                {badge > 99 ? '99+' : badge}
            </span>
        )}
    </Link>
);

export default HeaderIconButton;
