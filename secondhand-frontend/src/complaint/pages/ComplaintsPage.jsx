import PageContainer from '@/common/components/layout/PageContainer';
import { useTranslation } from "react-i18next";
import { useEffect } from 'react';
import { ShieldAlert, FileSearch } from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints.js';
import ComplaintCard from '../components/ComplaintCard.jsx';
const ComplaintsPage = () => {
 const {
 t
 } = useTranslation();
 const {
 complaints,
 isLoading,
 error,
 getUserComplaints
 } = useComplaints();
 useEffect(() => {
 getUserComplaints();
 }, [getUserComplaints]);
 return <div className="min-h-screen bg-background-secondary">
 <div className="sticky top-0 z-20 border-b border-border-light/80 bg-background-secondary">
 <PageContainer className="flex items-center justify-between py-4">
 <div className="flex items-center gap-4">
 <div className="relative flex h-12 w-12 items-center justify-center rounded-md bg-background-tertiary ring-1 ring-primary/40">
 <div className="absolute inset-px rounded-md bg-background-primary" />
 <ShieldAlert className="h-5 w-5 shrink-0 text-text-tertiary" strokeWidth={1.5} aria-hidden />
 </div>
 <div>
 <h1 className="text-2xl font-semibold text-text-primary tracking-tighter">{t("my_complaints")}</h1>
 <div className="mt-0.5 flex items-center gap-3 text-xs text-text-tertiary">
 <span className="leading-relaxed">{t("track_and_manage_your_submissions_to_our")}</span>
 </div>
 </div>
 </div>
 <div className="hidden sm:flex items-center gap-2">
 <div className="inline-flex items-center gap-2 rounded-sm border border-primary bg-background-tertiary/80 px-3 py-1 text-xs font-medium tracking-tight text-primary">
 <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
 <span>
 {complaints?.length || 0}{t("complaint")}{complaints?.length !== 1 ? 's' : ''}
 </span>
 </div>
 </div>
 </PageContainer>
 </div>

 <PageContainer className="pb-10 pt-6">
 {isLoading ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {[...Array(6)].map((_, i) => <div key={i} className="rounded-md border border-border-light/70 bg-background-primary/80 p-6 shadow-sm animate-pulse">
 <div className="space-y-4">
 <div className="flex items-center gap-3">
 <div className="h-9 w-9 rounded-md bg-background-tertiary" />
 <div className="space-y-2">
 <div className="h-4 w-28 rounded-md bg-background-tertiary" />
 <div className="h-3 w-40 rounded-md bg-background-tertiary" />
 </div>
 </div>
 <div className="space-y-2">
 <div className="h-3 w-3/4 rounded-md bg-background-tertiary" />
 <div className="h-3 w-2/3 rounded-md bg-background-tertiary" />
 <div className="h-3 w-5/6 rounded-md bg-background-tertiary" />
 </div>
 <div className="h-9 rounded-md bg-background-tertiary" />
 </div>
 </div>)}
 </div> : error ? <div className="flex items-center justify-center py-16">
 <div className="w-full max-w-md rounded-md border border-border/80 bg-background-primary/90 p-8 text-center shadow-sm">
 <ShieldAlert className="mx-auto mb-5 block h-5 w-5 shrink-0 text-status-error" strokeWidth={1.5} aria-hidden />
 <h3 className="text-sm font-medium text-text-primary tracking-tight">{t("unable_to_load_complaints")}</h3>
 <p className="mt-2 text-sm leading-relaxed text-text-tertiary">
 {error}
 </p>
 <button onClick={() => getUserComplaints()} className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 mt-5">{t("try_again")}</button>
 </div>
 </div> : complaints && complaints.length > 0 ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
 {complaints.map((complaint, index) => <div key={complaint?.complaintId || complaint?.id || `complaint-${index}`} className="rounded-md border border-border-light/70 bg-background-primary/90 shadow-sm transition-all duration-300 ease-in-out">
 <ComplaintCard complaint={complaint} />
 </div>)}
 </div> : <div className="flex items-center justify-center py-20">
 <div className="mx-auto max-w-md text-center">
 <FileSearch className="mx-auto mb-6 block h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
 <h3 className="text-sm font-medium text-text-primary tracking-tighter">{t("no_complaints_submitted")}</h3>
 <p className="mt-2 text-sm leading-relaxed text-text-tertiary">{t("if_you_encounter_inappropriate_behavior_")}</p>
 <button className="inline-flex items-center justify-center gap-2 rounded text-sm font-medium transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-primary text-white hover:bg-primary-hover h-10 px-4 mt-6">
 <span className="flex h-5 w-5 items-center justify-center rounded bg-primary-hover">
 <span className="h-2 w-2 rounded-full bg-background-primary" />
 </span>{t("submit_new_complaint")}</button>
 </div>
 </div>}
 </PageContainer>
 </div>;
};
export default ComplaintsPage;