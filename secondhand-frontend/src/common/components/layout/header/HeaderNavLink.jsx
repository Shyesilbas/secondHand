import { Link, useLocation } from 'react-router-dom';

const HeaderNavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(to.split('?')[0]);

    return (
        <Link
            to={to}
            className={`text-sm font-medium px-3.5 py-2 rounded-lg transition-all duration-200 ${
                isActive
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
            {children}
        </Link>
    );
};

export default HeaderNavLink;
