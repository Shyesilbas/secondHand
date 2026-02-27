import {Link} from 'react-router-dom';
import {ROUTES} from '../../common/constants/routes.js';
import ContactSellerButton from '../../chat/components/ContactSellerButton.jsx';
import ShowcaseButton from '../../showcase/components/ShowcaseButton.jsx';
import {FollowButton} from '../../follow/index.js';
import {ShieldCheck} from 'lucide-react';

const ListingTrustPanel = ({ listing, isOwner, onShowcaseSuccess }) => {
  if (!listing) return null;

  return (
    <>
      {/* Seller */}
      <div className="border-t border-gray-50 py-5 mb-5">
        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-3">Seller</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-[13px] font-semibold text-white shrink-0">
              {listing.sellerName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <Link
                to={ROUTES.USER_PROFILE(listing.sellerId)}
                className="text-[13px] font-semibold text-gray-900 hover:underline block"
              >
                {listing.sellerName} {listing.sellerSurname}
              </Link>
              {listing.sellerAccountCreationDate && (
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Since {new Date(listing.sellerAccountCreationDate).getFullYear()}
                </p>
              )}
            </div>
          </div>
          {!isOwner && (
            <FollowButton userId={listing.sellerId} size="sm" showDropdown={true} />
          )}
        </div>

        {!isOwner ? (
          <ContactSellerButton
            listing={listing}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-[13px] font-medium transition-colors"
          >
            Contact Seller
          </ContactSellerButton>
        ) : (
          <ShowcaseButton listingId={listing.id} onSuccess={onShowcaseSuccess} />
        )}
      </div>

      {/* Safety */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3" />
          Safety
        </h3>
        <ul className="space-y-1.5 text-[11px] text-gray-500 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-300 rounded-full mt-1.5 shrink-0" />
            <span>Meet in public, well-lit locations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-300 rounded-full mt-1.5 shrink-0" />
            <span>Inspect items thoroughly before purchase</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 bg-gray-300 rounded-full mt-1.5 shrink-0" />
            <span>Avoid advance payments or wire transfers</span>
          </li>
        </ul>
      </div>
    </>
  );
};

export default ListingTrustPanel;

