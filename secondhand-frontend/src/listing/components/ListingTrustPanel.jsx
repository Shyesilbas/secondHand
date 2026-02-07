import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constants/routes.js';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ShowcaseButton from '../../showcase/components/ShowcaseButton.jsx';
import { FollowButton } from '../../follow/index.js';
import { ShieldCheck } from 'lucide-react';

const ListingTrustPanel = ({ listing, isOwner, onShowcaseSuccess }) => {
  if (!listing) return null;

  return (
    <>
      <div className="border-t border-b border-slate-200/60 py-6 mb-6">
        <div className="mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Seller</h3>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-base font-bold text-white shadow-sm">
                {listing.sellerName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <Link
                  to={ROUTES.USER_PROFILE(listing.sellerId)}
                  className="font-bold text-base text-slate-900 hover:text-slate-700 block transition-all duration-300 ease-in-out tracking-tight"
                >
                  {listing.sellerName} {listing.sellerSurname}
                </Link>
                {listing.sellerAccountCreationDate && (
                  <div className="text-xs text-slate-500 mt-1 font-medium tracking-tight">
                    Member since {new Date(listing.sellerAccountCreationDate).getFullYear()}
                  </div>
                )}
              </div>
            </div>
            {!isOwner && (
              <FollowButton userId={listing.sellerId} size="sm" showDropdown={true} />
            )}
          </div>

          {!isOwner ? (
            <div className="space-y-3">
              <ContactSellerButton
                listing={listing}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl tracking-tight"
              >
                Contact Seller
              </ContactSellerButton>
            </div>
          ) : (
            <ShowcaseButton listingId={listing.id} onSuccess={onShowcaseSuccess} />
          )}
        </div>
      </div>

      <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-200/40">
        <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          Safety Guidelines
        </h3>
        <ul className="space-y-2 text-xs text-slate-600 leading-relaxed tracking-tight">
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Meet in public, well-lit locations</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Inspect items thoroughly before purchase</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>Avoid advance payments or wire transfers</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ListingTrustPanel;

