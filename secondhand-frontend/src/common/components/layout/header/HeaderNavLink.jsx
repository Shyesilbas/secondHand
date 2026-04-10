import { Link } from 'react-router-dom';

const HeaderNavLink = ({ to, children }) => (
    <Link
        to={to}
        className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-300 ease-in-out px-4 py-2.5 rounded-xl"
    >
        {children}
    </Link>
);

export default HeaderNavLink;
