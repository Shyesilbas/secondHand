import React from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

const BulkShowcaseBanner = ({ onBoostClick }) => {
  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex-1 space-y-2">
        {/* Minimalist Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.8 bg-slate-200/50 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200/40 select-none">
          <Sparkles className="w-3 h-3 text-slate-500" />
          Bulk Promotion
        </div>
        
        {/* Simple crisp title */}
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Boost Your Listing Visibility
        </h2>
        
        {/* Simple quiet description */}
        <p className="text-slate-500 text-xs leading-relaxed max-w-xl">
          Promote <strong className="text-slate-800 font-bold">4 or more items</strong> at the same time and instantly receive a <strong className="text-indigo-600 font-bold">10% discount</strong> on the total cost.
        </p>

        {/* Quiet labels */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span>Increase views</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full" />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Zap className="w-3.5 h-3.5 text-slate-400" />
            <span>Accelerate checkout</span>
          </div>
        </div>
      </div>

      {/* Elegant, clean minimalist button */}
      <button 
        onClick={onBoostClick}
        className="w-full md:w-auto shrink-0 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition-colors duration-200 active:scale-98 flex items-center justify-center gap-2 border border-transparent shadow-sm"
      >
        <Zap className="w-3.5 h-3.5 shrink-0" />
        <span>Boost Listings</span>
      </button>
    </div>
  );
};

export default BulkShowcaseBanner;
