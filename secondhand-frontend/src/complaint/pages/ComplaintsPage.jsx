import React, { useEffect } from 'react';
import { ShieldAlert, FileSearch } from 'lucide-react';
import { useComplaints } from '../hooks/useComplaints.js';
import ComplaintCard from '../components/ComplaintCard.jsx';

const ComplaintsPage = () => {
    const { complaints, isLoading, error, getUserComplaints } = useComplaints();

    useEffect(() => {
        getUserComplaints();
    }, [getUserComplaints]);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#F8FAFC]/80 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-slate-50 to-slate-100 shadow-[0_18px_55px_rgba(15,23,42,0.18)] ring-1 ring-indigo-500/40">
                            <div className="absolute inset-px rounded-2xl bg-white/60 backdrop-blur-md" />
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-slate-900 text-white">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tighter text-slate-900">
                                My Complaints
                            </h1>
                            <div className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
                                <span className="leading-relaxed">
                                    Track and manage your submissions to our support team.
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-medium tracking-tight text-indigo-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_0_4px_rgba(79,70,229,0.35)] animate-pulse" />
                            <span>
                                {complaints?.length || 0} complaint{complaints?.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm animate-pulse"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-2xl bg-slate-100" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-28 rounded-2xl bg-slate-100" />
                                            <div className="h-3 w-40 rounded-2xl bg-slate-100" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-3/4 rounded-2xl bg-slate-100" />
                                        <div className="h-3 w-2/3 rounded-2xl bg-slate-100" />
                                        <div className="h-3 w-5/6 rounded-2xl bg-slate-100" />
                                    </div>
                                    <div className="h-9 rounded-2xl bg-slate-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-full max-w-md rounded-3xl border border-rose-200/80 bg-white/90 p-8 text-center shadow-[0_18px_55px_rgba(248,113,113,0.18)]">
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-50">
                                <ShieldAlert className="h-7 w-7 text-rose-500" />
                            </div>
                            <h3 className="text-base font-semibold tracking-tight text-slate-900">
                                Unable to load complaints
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold tracking-tight text-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : complaints && complaints.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {complaints.map((complaint, index) => (
                            <div
                                key={complaint?.complaintId || complaint?.id || `complaint-${index}`}
                                className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50"
                            >
                                <ComplaintCard complaint={complaint} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-20">
                        <div className="mx-auto max-w-md text-center">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/10 via-slate-100 to-slate-50">
                                <FileSearch className="h-10 w-10 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-semibold tracking-tighter text-slate-900">
                                No complaints submitted
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                If you encounter inappropriate behavior or issues, you can submit a complaint. Our support team will review and respond to your concerns.
                            </p>
                            <button className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold tracking-tight text-white shadow-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg">
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800">
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                </span>
                                Submit New Complaint
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsPage;
