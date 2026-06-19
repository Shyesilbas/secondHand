import {useTranslation} from "react-i18next";
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {REVIEW_LIMITS} from '../reviewConstants.js';
import {formatReviewDate} from '../utils/reviewDateFormat.js';
import {RatingStarsDisplay} from './RatingStarsDisplay.jsx';
import {ROUTES} from '../../common/constants/routes.js';
import {listingService} from '../../listing/services/listingService.js';
import {Loader2} from 'lucide-react';

const listingFooterClass = 'group/footer w-full rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-left transition-colors hover:border-amber-200/80 hover:bg-amber-50/60';
const labelBlock = (review, t) => <>
    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">{t("listed_item")}</span>
    <span className="min-w-0 truncate font-medium text-gray-800">{review.listingTitle || '—'}</span>
    {review.listingNo ? <span className="shrink-0 font-normal tabular-nums text-gray-500">#{review.listingNo}</span> : null}
  </>;

/** Yalnızca o ilanın detayına; listings / prefilter yönlendirmesi yok. */
function ProfileReviewedListingLink({
  review
}) {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const listingId = review?.listingId != null && String(review.listingId).trim() !== '' ? String(review.listingId).trim() : '';
  const rawNo = review?.listingNo != null ? String(review.listingNo).trim() : '';
  const row = <div className="relative flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
      {labelBlock(review, t)}
      <span className="sr-only">{t("open_listing")}</span>
      {busy ? <Loader2 className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-amber-700" aria-hidden /> : <span className="pointer-events-none ml-auto text-[10px] font-semibold uppercase tracking-wide text-amber-700 opacity-0 transition-opacity group-hover/footer:opacity-100">{t("view")}</span>}
    </div>;
  if (listingId) {
    return <Link to={ROUTES.LISTING_DETAIL(listingId)} className={`${listingFooterClass} block focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-500/40`}>
        {row}
      </Link>;
  }
  if (!rawNo) {
    return <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">{labelBlock(review, t)}</div>
      </div>;
  }
  const go = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const listing = await listingService.getListingByNo(rawNo);
      if (listing?.id) navigate(ROUTES.LISTING_DETAIL(listing.id));
    } finally {
      setBusy(false);
    }
  };
  return <button type="button" onClick={go} disabled={busy} className={listingFooterClass} aria-busy={busy}>
      {row}
    </button>;
}
const ReviewCard = ({
  review,
  variant = 'default'
}) => {
  const {
    t
  } = useTranslation();
  const isProfile = variant === 'profile';
  const shell = isProfile ? 'rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-gray-300/90 hover:shadow-md' : 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm';
  const initials = <span className={isProfile ? 'text-[14px] font-bold text-white' : 'text-sm font-medium text-gray-600'}>
      {review.reviewerName?.[0]?.toUpperCase() || '?'}
    </span>;
  const avatar = isProfile ? <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-sm ring-2 ring-gray-100">
      {initials}
    </div> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200">{initials}</div>;
  const nameLine = `${review.reviewerName || ''} ${review.reviewerSurname || ''}`.trim() || 'Buyer';
  const listingId = review?.listingId != null && String(review.listingId).trim() !== '' ? String(review.listingId).trim() : '';
  return <article className={shell}>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {review.reviewerId && isProfile ? <Link to={ROUTES.USER_PROFILE(review.reviewerId)} className="shrink-0 rounded-xl focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-500/50" title={t("view_reviewer_profile")}>
              {avatar}
            </Link> : avatar}
          <div className="min-w-0">
            {review.reviewerId && isProfile ? <Link to={ROUTES.USER_PROFILE(review.reviewerId)} className="block truncate text-[15px] font-semibold leading-tight text-gray-900 hover:text-amber-800 hover:underline underline-offset-2">
                {nameLine}
              </Link> : <p className={`font-medium text-gray-900 ${isProfile ? 'truncate text-[15px] leading-tight' : ''}`}>{nameLine}</p>}
            <time className={`${isProfile ? 'text-xs' : 'text-sm'} mt-1 block text-gray-500`} dateTime={review.createdAt}>
              {formatReviewDate(review.createdAt)}
            </time>
          </div>
        </div>
        <div className={isProfile ? 'flex w-fit shrink-0 items-center gap-2 self-start rounded-xl border border-amber-100/90 bg-amber-50/85 px-3 py-2 sm:self-start' : 'flex shrink-0 items-center space-x-1'}>
          <RatingStarsDisplay value={review.rating} iconClassName="h-4 w-4" mode="ceil" />
          <span className="ml-1 text-xs font-bold tabular-nums text-gray-800">
            {review.rating}/{REVIEW_LIMITS.MAX_RATING}
          </span>
        </div>
      </div>

      {review.comment ? <p className={isProfile ? 'mb-4 border-l-[3px] border-amber-200/95 pl-4 text-sm leading-relaxed text-gray-800' : 'mb-3 text-sm leading-relaxed text-gray-700'}>
          {review.comment}
        </p> : null}

      {isProfile ? <ProfileReviewedListingLink review={review} /> : <footer className="border-t pt-3">
          {listingId ? <Link to={ROUTES.LISTING_DETAIL(listingId)} className="text-xs leading-snug text-gray-500 underline-offset-2 hover:text-amber-800 hover:underline">{t("product")}<span className="font-medium text-gray-800">{review.listingTitle}</span>
              {review.listingNo ? <span className="ml-2 tabular-nums">({review.listingNo})</span> : null}
            </Link> : <p className="text-xs leading-snug text-gray-500">{t("product")}<span className="font-medium text-gray-800">{review.listingTitle}</span>
              {review.listingNo ? <span className="ml-2 tabular-nums">({review.listingNo})</span> : null}
            </p>}
        </footer>}
    </article>;
};
export default ReviewCard;