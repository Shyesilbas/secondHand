import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Modal } from '../../common/components/ui/index.js';
import { campaignService } from '../../listing/services/campaignService.js';
import { listingService } from '../../listing/services/listingService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { formatCurrency } from '../../common/formatters.js';
const defaultForm = {
 name: '',
 active: true,
 discountKind: 'PERCENT',
 value: '',
 startsAt: '',
 endsAt: '',
 mode: 'LISTING',
 // ALL, LISTING, TYPE
 campaignType: 'STANDARD',
 // STANDARD, BUNDLE
 eligibleListingIds: [],
 eligibleTypes: [],
 minQuantity: 1,
 applyToFutureListings: false
};
const toLocalDateTime = value => {
 if (!value) return null;
 return value.length === 16 ? `${value}:00` : value;
};
const normalizeCampaign = campaign => {
 if (!campaign) return null;
 const eligibleListingIds = Array.isArray(campaign.eligibleListingIds) ? campaign.eligibleListingIds : [];
 const eligibleTypes = Array.isArray(campaign.eligibleTypes) ? campaign.eligibleTypes : [];
 const isBundle = campaign.minQuantity > 1 && !eligibleListingIds.length && !eligibleTypes.length;
 let mode = 'ALL';
 if (eligibleListingIds.length > 0) mode = 'LISTING';else if (eligibleTypes.length > 0) mode = 'TYPE';
 return {
 id: campaign.id,
 name: campaign.name || '',
 active: Boolean(campaign.active),
 discountKind: campaign.discountKind || 'PERCENT',
 value: campaign.value != null ? String(campaign.value) : '',
 startsAt: campaign.startsAt ? campaign.startsAt.slice(0, 16) : '',
 endsAt: campaign.endsAt ? campaign.endsAt.slice(0, 16) : '',
 mode,
 campaignType: isBundle ? 'BUNDLE' : 'STANDARD',
 eligibleListingIds,
 eligibleTypes,
 minQuantity: campaign.minQuantity != null ? Number(campaign.minQuantity) : 1,
 applyToFutureListings: Boolean(campaign.applyToFutureListings)
 };
};
const CreateCampaignModal = ({
 isOpen,
 onClose,
 onSuccess,
 initialListingId,
 editingCampaign
}) => {
 const {
 t
 } = useTranslation();
 const {
 showError,
 showSuccess
 } = useNotification();
 const [form, setForm] = useState(defaultForm);
 const [isSaving, setIsSaving] = useState(false);
 const { data: myListings = [] } = useQuery({
 queryKey: ['myListingsForCampaign'],
 queryFn: async () => {
 const res = await listingService.getMyListings(0, 50);
 return Array.isArray(res) ? res : Array.isArray(res?.content) ? res.content : [];
 },
 enabled: isOpen,
 staleTime: 2 * 60 * 1000,
 });
 const availableListings = useMemo(() => {
 return (myListings || []).filter(l => l?.type !== 'VEHICLE' && l?.type !== 'REAL_ESTATE');
 }, [myListings]);
 const availableTypes = useMemo(() => {
 const types = new Set();
 availableListings.forEach(l => {
 if (l?.type) types.add(l.type);
 });
 return Array.from(types).sort();
 }, [availableListings]);
 // My listings are now fetched and cached using useQuery above
 useEffect(() => {
 if (!isOpen) return;
 if (editingCampaign) {
 setForm(normalizeCampaign(editingCampaign) || defaultForm);
 return;
 }
 if (initialListingId) {
 setForm({
 ...defaultForm,
 mode: 'LISTING',
 eligibleListingIds: [initialListingId]
 });
 return;
 }
 setForm(defaultForm);
 }, [isOpen, initialListingId, editingCampaign]);
 if (!isOpen) return null;
 const save = async () => {
 setIsSaving(true);
 try {
 const payload = {
 name: form.name?.trim(),
 active: Boolean(form.active),
 startsAt: toLocalDateTime(form.startsAt),
 endsAt: toLocalDateTime(form.endsAt),
 discountKind: form.discountKind,
 value: form.value !== '' ? Number(form.value) : null,
 eligibleListingIds: form.campaignType === 'STANDARD' && form.mode === 'LISTING' ? form.eligibleListingIds : null,
 eligibleTypes: form.campaignType === 'STANDARD' && form.mode === 'TYPE' ? form.eligibleTypes : null,
 minQuantity: form.campaignType === 'BUNDLE' ? form.minQuantity || 2 : 1,
 applyToFutureListings: form.campaignType === 'BUNDLE' || Boolean(form.applyToFutureListings)
 };
 if (editingCampaign?.id) {
 await campaignService.update(editingCampaign.id, payload);
 showSuccess('Campaign updated', 'Your campaign has been updated.');
 } else {
 await campaignService.create(payload);
 showSuccess('Campaign created', 'Your campaign has been created.');
 }
 onSuccess?.();
 onClose?.();
 } catch (e) {
 showError('Campaign', e?.response?.data?.message || 'Failed to save campaign');
 } finally {
 setIsSaving(false);
 }
 };
 return <Modal isOpen={isOpen} onClose={onClose} title={editingCampaign ? 'Edit campaign' : 'Create new campaign'} description={t("boost_your_sales_with_attractive_discoun")} size="xl" footer={<>
 <Button variant="secondary" onClick={onClose}>{t("cancel")}</Button>
 <Button onClick={save} disabled={isSaving}>{isSaving ? 'Processing...' : editingCampaign ? 'Save changes' : 'Launch campaign'}</Button>
 </>}>
 <div className="-mx-5 -my-4 flex min-h-0 flex-col sm:flex-row">
 {/* Sidebar - Campaign Type Selection */}
 <div className="shrink-0 space-y-2 border-b border-border-light bg-background-secondary p-5 sm:w-64 sm:border-b-0 sm:border-r">
 <div className="mb-2 text-sm font-medium text-text-primary">{t("choose_type")}</div>
 
 <button onClick={() => setForm(p => ({
 ...p,
 campaignType: 'STANDARD',
 minQuantity: 1
 }))} type="button" aria-pressed={form.campaignType === 'STANDARD'} className={`w-full rounded border p-4 text-left transition-colors ${form.campaignType === 'STANDARD' ? 'border-primary bg-background-primary text-text-primary ring-1 ring-primary' : 'border-transparent text-text-secondary hover:border-border hover:bg-background-primary'}`}>
 <div className="text-sm font-medium">{t("standard_discount")}</div>
 <div className="mt-1 text-xs text-text-tertiary">{t("apply_to_specific_items_or_categories")}</div>
 </button>

 <button onClick={() => setForm(p => ({
 ...p,
 campaignType: 'BUNDLE',
 mode: 'ALL',
 minQuantity: 2
 }))} type="button" aria-pressed={form.campaignType === 'BUNDLE'} className={`w-full rounded border p-4 text-left transition-colors ${form.campaignType === 'BUNDLE' ? 'border-primary bg-background-primary text-text-primary ring-1 ring-primary' : 'border-transparent text-text-secondary hover:border-border hover:bg-background-primary'}`}>
 <div className="text-sm font-medium">{t("bundle_save")}</div>
 <div className="mt-1 text-xs text-text-tertiary">{t("multi_item_rewards_for_all_your_listings")}</div>
 </button>
 </div>

 {/* Main Content */}
 <div className="min-w-0 flex-1 p-5 sm:p-6">
 <div className="space-y-8">
 {/* Basic Info Section */}
 <section className="space-y-4">
 <div className="text-sm font-semibold text-text-primary">{t("basic_information")}</div>
 <div className="grid grid-cols-1 gap-4">
 <div className="relative">
 <label className="absolute -top-2 left-3 px-1 bg-background-primary text-xs font-semibold text-text-muted">{t("campaign_name")}</label>
 <input value={form.name} onChange={e => setForm(p => ({
 ...p,
 name: e.target.value
 }))} className="w-full px-4 py-3.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder={t("e_g_summer_special_2024")} />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="relative">
 <label className="absolute -top-2 left-3 px-1 bg-background-primary text-xs font-semibold text-text-muted">{t("discount_type")}</label>
 <select value={form.discountKind} onChange={e => setForm(p => ({
 ...p,
 discountKind: e.target.value
 }))} className="w-full px-4 py-3.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-background-primary">
 <option value="PERCENT">{t("percentage")}</option>
 <option value="FIXED">{t("fixed_amount")}</option>
 </select>
 </div>
 <div className="relative">
 <label className="absolute -top-2 left-3 px-1 bg-background-primary text-xs font-semibold text-text-muted">{t("value")}</label>
 <input value={form.value} onChange={e => setForm(p => ({
 ...p,
 value: e.target.value
 }))} type="number" className="w-full px-4 py-3.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="0.00" />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div className="relative">
 <label className="absolute -top-2 left-3 px-1 bg-background-primary text-xs font-semibold text-text-muted">{t("starts_at")}</label>
 <input type="datetime-local" value={form.startsAt} onChange={e => setForm(p => ({
 ...p,
 startsAt: e.target.value
 }))} className="w-full px-4 py-3.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
 </div>
 <div className="relative">
 <label className="absolute -top-2 left-3 px-1 bg-background-primary text-xs font-semibold text-text-muted">{t("ends_at")}</label>
 <input type="datetime-local" value={form.endsAt} onChange={e => setForm(p => ({
 ...p,
 endsAt: e.target.value
 }))} className="w-full px-4 py-3.5 border border-border rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
 </div>
 </div>
 </section>

 {/* Type Specific Section */}
 {form.campaignType === 'BUNDLE' ? <section className="p-6 bg-background-tertiary border border-primary rounded-md space-y-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center">
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 </div>
 <div className="text-sm font-semibold text-primary">{t("bundle_configuration")}</div>
 </div>
 
 <div className="space-y-4">
 <div className="relative">
 <label className="absolute -top-2 left-3 px-1 bg-background-tertiary text-xs font-semibold text-primary">{t("minimum_item_quantity")}</label>
 <input type="number" min="2" value={form.minQuantity} onChange={e => setForm(p => ({
 ...p,
 minQuantity: e.target.value
 }))} className="w-full px-4 py-3.5 bg-background-primary border border-primary rounded focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
 </div>
 <p className="text-xs text-primary leading-relaxed">{t("this_bundle_will_automatically_apply_to")}<b>{t("all_your_active_listings")}</b>{t("customers_will_receive_the_discount_only")}<b>{form.minQuantity || 2}{t("or_more")}</b>{t("items_to_their_cart")}</p>
 </div>
 </section> : <section className="space-y-4">
 <div className="text-sm font-semibold text-text-primary">{t("select_eligibility")}</div>
 <div className="flex gap-2">
 {['ALL', 'LISTING', 'TYPE'].map(m => <button key={m} onClick={() => setForm(p => ({
 ...p,
 mode: m,
 eligibleListingIds: [],
 eligibleTypes: []
 }))} className={`px-4 py-2 rounded text-xs font-semibold border transition-all ${form.mode === m ? 'bg-primary text-white border-primary' : 'bg-background-primary text-text-secondary border-border hover:border-primary'}`}>
 {m === 'ALL' ? 'Everything' : m === 'LISTING' ? 'Specific Listings' : 'Listing Types'}
 </button>)}
 </div>

 {form.mode === 'LISTING' && <div className="border border-border rounded-md overflow-hidden">
 <div className="max-h-48 overflow-y-auto p-4 space-y-2">
 {availableListings.map(l => <label key={l.id} className="flex items-center gap-3 p-2 hover:bg-background-secondary rounded cursor-pointer transition-colors">
 <input type="checkbox" checked={form.eligibleListingIds.includes(l.id)} onChange={() => {
 setForm(p => {
 const exists = p.eligibleListingIds.includes(l.id);
 const newList = exists ? p.eligibleListingIds.filter(id => id !== l.id) : [...p.eligibleListingIds, l.id];
 return {
 ...p,
 eligibleListingIds: newList
 };
 });
 }} className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary" />
 <div className="flex-1 min-w-0">
 <div className="text-sm font-medium text-text-primary truncate">{l.title}</div>
 <div className="text-xs text-text-muted">{formatCurrency(l.price, l.currency)}</div>
 </div>
 </label>)}
 </div>
 </div>}

 {form.mode === 'TYPE' && <div className="flex flex-wrap gap-2 p-2">
 {availableTypes.map(t => <button key={t} onClick={() => {
 setForm(p => {
 const exists = p.eligibleTypes.includes(t);
 const newList = exists ? p.eligibleTypes.filter(type => type !== t) : [...p.eligibleTypes, t];
 return {
 ...p,
 eligibleTypes: newList
 };
 });
 }} className={`px-4 py-2 rounded text-xs font-semibold border transition-all ${form.eligibleTypes.includes(t) ? 'bg-primary text-white border-primary' : 'bg-background-secondary text-text-secondary border-border'}`}>
 {t}
 </button>)}
 </div>}
 </section>}

 <section className="flex items-center justify-between p-4 bg-background-secondary rounded-md border border-border-light">
 <div>
 <div className="text-sm font-semibold text-text-primary">{t("active_status")}</div>
 <div className="text-xs text-text-muted">{t("campaign_will_be_visible_once_saved")}</div>
 </div>
 <button type="button" onClick={() => setForm(p => ({
 ...p,
 active: !p.active
 }))} className={`w-14 h-8 rounded-full transition-all relative ${form.active ? 'bg-primary' : 'bg-secondary-200'}`}>
 <div className={`absolute top-1 w-6 h-6 bg-background-primary rounded-full transition-all ${form.active ? 'left-7' : 'left-1'}`} />
 </button>
 </section>
 </div>
 </div>
 </div>

 </Modal>;
};
export default CreateCampaignModal;