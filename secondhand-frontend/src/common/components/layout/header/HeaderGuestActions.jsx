import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

const HeaderGuestActions = () => (
    <div className="flex items-center gap-2">
        <Link
            to={ROUTES.LOGIN}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3.5 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
            Sign In
        </Link>
        <Link
            to={ROUTES.REGISTER}
            className="text-sm font-semibold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm"
        >
            Join Now
        </Link>
    </div>
);

export default HeaderGuestActions;
