import {useTranslation} from "react-i18next";
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {REVIEW_LIMITS} from '../reviewConstants.js';
import {formatReviewDate} from '../utils/reviewDateFormat.js';
import {RatingStarsDisplay} from './RatingStarsDisplay.jsx';
import {ROUTES} from '../../common/constants/routes.js';
import {listingService} from '../../listing/services/listingService.js';
import {Loader2} from 'lucide-react';
import { Card } from '../../common/components/ui/index.js';

const listingFooterClass = 'group/footer w-full rounded bg-background-secondary px-3 py-2.5 text-left transition-colors duration-150 hover:bg-background-tertiary';
const labelBlock = (review, t) => <>
 <span className="shrink-0 text-sm text-text-tertiary">{t("listed_item")}</span>
 <span className="min-w-0 truncate font-medium text-text-primary">{review.listingTitle || '—'}</span>
 {review.listingNo ? <span className="shrink-0 font-normal tabular-nums text-text-muted">#{review.listingNo}</span> : null}
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
 const row = <div className="relative flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
 {labelBlock(review, t)}
 <span className="sr-only">{t("open_listing")}</span>
 {busy ? <Loader2 className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-primary" aria-hidden strokeWidth={1.5} /> : <span className="pointer-events-none ml-auto text-sm font-medium text-text-link opacity-0 transition-opacity group-hover/footer:opacity-100">{t("view")}</span>}
 </div>;
 if (listingId) {
 return <Link to={ROUTES.LISTING_DETAIL(listingId)} className={`${listingFooterClass} block focus-visible:outline focus-visible:ring-2 focus-visible:ring-border-focus`}>
 {row}
 </Link>;
 }
 if (!rawNo) {
 return <div className="rounded bg-background-secondary px-3 py-2.5">
 <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-muted">{labelBlock(review, t)}</div>
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
 variant = 'default',
 // inline only: 'given' shows the reviewed user instead of the reviewer (the page owner wrote it).
 perspective = 'received',
 // inline only: link to the reviewed listing (off inside the listing's own page).
 showListing = false
}) => {
 const {
 t
 } = useTranslation();
 const isProfile = variant === 'profile';
 const nameText = `${review.reviewerName || ''} ${review.reviewerSurname || ''}`.trim() || 'Buyer';
 // 'inline': a borderless row inside a divided list (listing reviews, received/given reviews pages).
 if (variant === 'inline') {
 const isGiven = perspective === 'given';
 const personId = isGiven ? review.reviewedUserId : review.reviewerId;
 const personName = isGiven
 ? `${review.reviewedUserName || ''} ${review.reviewedUserSurname || ''}`.trim() || t('user', 'Kullanıcı')
 : nameText;
 const personLabel = isGiven ? t('review_given_to', { defaultValue: '{{name}} için', name: personName }) : personName;
 const inlineListingId = review?.listingId != null && String(review.listingId).trim() !== '' ? String(review.listingId).trim() : '';
 return <article className="flex items-start gap-3 py-4">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-tertiary text-sm font-medium text-text-secondary" aria-hidden>
 {personName[0]?.toUpperCase() || '?'}
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
 {personId && showListing
 ? <Link to={ROUTES.USER_PROFILE(personId)} className="truncate rounded text-sm font-medium text-text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
 {personLabel}
 </Link>
 : <p className="truncate text-sm font-medium text-text-primary">{personLabel}</p>}
 <time className="shrink-0 text-sm tabular-nums text-text-tertiary" dateTime={review.createdAt}>
 {formatReviewDate(review.createdAt)}
 </time>
 </div>
 <div className="mt-1 flex gap-0.5">
 <RatingStarsDisplay value={review.rating} iconClassName="h-3.5 w-3.5" mode="ceil" />
 <span className="sr-only">{review.rating}/{REVIEW_LIMITS.MAX_RATING}</span>
 </div>
 {review.comment ? <p className="mt-2 max-w-prose break-words text-base leading-relaxed text-text-secondary">{review.comment}</p> : null}
 {showListing && review.listingTitle ? <p className="mt-2 min-w-0 truncate text-sm text-text-tertiary">
 {t('review_listing_label', 'İlan')}:{' '}
 {inlineListingId
 ? <Link to={ROUTES.LISTING_DETAIL(inlineListingId)} className="rounded text-text-secondary hover:text-text-link hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">{review.listingTitle}</Link>
 : <span className="text-text-secondary">{review.listingTitle}</span>}
 {review.listingNo ? <span className="tabular-nums"> · #{review.listingNo}</span> : null}
 </p> : null}
 </div>
 </article>;
 }
 const cardClass = '';
 const initials = <span className="text-sm font-medium text-text-secondary">
 {review.reviewerName?.[0]?.toUpperCase() || '?'}
 </span>;
 const avatar = <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background-tertiary">{initials}</div>;
 const nameLine = nameText;
 const listingId = review?.listingId != null && String(review.listingId).trim() !== '' ? String(review.listingId).trim() : '';
 return <Card as="article" padding={isProfile ? 'normal' : 'compact'} border="light" shadow={false} className={cardClass}>
 <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div className="flex min-w-0 items-start gap-3">
 {review.reviewerId && isProfile ? <Link to={ROUTES.USER_PROFILE(review.reviewerId)} className="shrink-0 rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-border-focus" title={t("view_reviewer_profile")}>
 {avatar}
 </Link> : avatar}
 <div className="min-w-0">
 {review.reviewerId && isProfile ? <Link to={ROUTES.USER_PROFILE(review.reviewerId)} className="block truncate text-base font-semibold leading-tight text-text-primary hover:text-primary hover:underline underline-offset-2">
 {nameLine}
 </Link> : <p className={`font-medium text-text-primary ${isProfile ? 'truncate text-base leading-tight' : ''}`}>{nameLine}</p>}
 <time className="mt-0.5 block text-sm tabular-nums text-text-tertiary" dateTime={review.createdAt}>
 {formatReviewDate(review.createdAt)}
 </time>
 </div>
 </div>
 <div className={isProfile ? 'flex w-fit shrink-0 items-center gap-2 self-start' : 'flex shrink-0 items-center space-x-1'}>
 <RatingStarsDisplay value={review.rating} iconClassName="h-4 w-4" mode="ceil" />
 <span className="ml-1 text-sm font-medium tabular-nums text-text-primary">
 {review.rating}/{REVIEW_LIMITS.MAX_RATING}
 </span>
 </div>
 </div>

 {review.comment ? <p className={isProfile ? 'mb-4 max-w-prose break-words text-base leading-relaxed text-text-primary' : 'mb-3 max-w-prose break-words text-base leading-relaxed text-text-secondary'}>
 {review.comment}
 </p> : null}

 {isProfile ? <ProfileReviewedListingLink review={review} /> : <footer className="border-t border-border-light pt-3">
 {listingId ? <Link to={ROUTES.LISTING_DETAIL(listingId)} className="text-sm leading-snug text-text-muted underline-offset-2 hover:text-primary hover:underline">{t("product")}<span className="font-medium text-text-primary">{review.listingTitle}</span>
 {review.listingNo ? <span className="ml-2 tabular-nums">({review.listingNo})</span> : null}
 </Link> : <p className="text-sm leading-snug text-text-muted">{t("product")}<span className="font-medium text-text-primary">{review.listingTitle}</span>
 {review.listingNo ? <span className="ml-2 tabular-nums">({review.listingNo})</span> : null}
 </p>}
 </footer>}
 </Card>;
};
export default ReviewCard;