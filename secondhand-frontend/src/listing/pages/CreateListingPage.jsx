import { useLayoutEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEnums } from '../../common/hooks/useEnums.js';
import { createFormRegistry, isCreateSelectionComplete } from '../config/listingConfig.js';
import RestrictionBanner from '../../complaint/components/RestrictionBanner.jsx';
import { useMyRestriction } from '../../complaint/hooks/useComplaints.js';
import { ROUTES } from '../../common/constants/routes.js';

/** Form only; category + selectors are completed on /listings/prefilter?flow=create */
const CreateListingPage = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const st = location.state;
 const { enums } = useEnums();
 const { data: restriction } = useMyRestriction();
 const creationBlocked = restriction?.canCreateListings === false;

 const listingType = useMemo(() => {
 if (!st?.fromListingPrefilter || !st?.listingType) return null;
 return String(st.listingType).toUpperCase();
 }, [st?.fromListingPrefilter, st?.listingType]);

 const selection = st?.selection && typeof st.selection === 'object' ? st.selection : {};
 const SelectedForm = listingType ? createFormRegistry[listingType] : null;
 const complete = !creationBlocked && Boolean(
 listingType && SelectedForm && isCreateSelectionComplete(listingType, selection, enums),
 );

 useLayoutEffect(() => {
 if (complete) return;
 navigate(ROUTES.LISTINGS_PREFILTER_CREATE, { replace: true });
 }, [complete, navigate]);

 if (creationBlocked) {
 return <div className="mx-auto max-w-2xl p-6"><RestrictionBanner /></div>;
 }

 if (!complete || !SelectedForm) {
 return null;
 }

 return (
 <div className="w-full">
 <SelectedForm
 onBack={() => navigate(ROUTES.LISTINGS_PREFILTER_CREATE)}
 initialData={selection}
 />
 </div>
 );
};

export default CreateListingPage;
