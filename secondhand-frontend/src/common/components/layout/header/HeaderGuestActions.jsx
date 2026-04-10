import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes.js';

const HeaderGuestActions = () => (
    <div className="flex items-center gap-3">
        <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/50 px-4 py-2.5 rounded-xl transition-all duration-300 ease-in-out">Sign In</Link>
        <Link to={ROUTES.REGISTER} className="text-sm font-semibold bg-slate-900 text-white px-6 py-2.5 rounded-xl hover:bg-slate-800 transition-all duration-300 ease-in-out shadow-sm">Join Now</Link>
    </div>
);

export default HeaderGuestActions;
