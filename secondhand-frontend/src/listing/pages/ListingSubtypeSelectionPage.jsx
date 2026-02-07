import {useNavigate} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';

const ListingSubtypeSelectionPage = () => {
  const navigate = useNavigate();
  navigate(ROUTES.CREATE_LISTING, { replace: true });
  return null;
};

export default ListingSubtypeSelectionPage;

