import React from 'react';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

const BulkShowcaseBanner = ({ onBoostClick }) => {
  return (
    <div className="relative overflow-hidden bg-[#0F172A] rounded-[2rem] p-6 text-white shadow-xl border border-slate-800 group">
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-violet-600/10 rounded-full blur-[60px] pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-wider text-amber-500 border border-amber-500/20">
            <Sparkles className="w-3 h-3 fill-amber-500" />
            Limited Offer
          </div>
          
          <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Maximize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200">Visibility</span>
          </h2>
          
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
            Showcase <span className="text-white font-bold underline decoration-amber-500 underline-offset-4">4+ listings</span> 
            and get <span className="text-amber-400 font-black">10% Off</span> instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              3x More Views
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
              Faster Sales
            </div>
          </div>
        </div>

        <div className="shrink-0 relative group/btn">
          <div className="absolute inset-0 bg-amber-500 rounded-2xl blur-xl opacity-10 group-hover/btn:opacity-30 transition-opacity duration-500" />
          <button 
            onClick={onBoostClick}
            className="relative px-8 py-4 bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 rounded-2xl font-black text-sm shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-2 overflow-hidden"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            Boost My Listings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkShowcaseBanner;
