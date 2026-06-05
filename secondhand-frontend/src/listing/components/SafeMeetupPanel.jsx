import { ShieldCheck, Wallet, MapPin, QrCode } from 'lucide-react';

const SafeMeetupPanel = () => {
  return (
    <div className="bg-slate-50/60 border border-slate-100/80 rounded-3xl p-6 sm:p-8 mb-10 shadow-[0_2px_8px_-1px_rgba(15,23,42,0.01)]">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        Safe Meetup Protection
      </h3>
      <p className="text-sm leading-relaxed text-slate-600 font-medium mb-6">
        This transaction is secured by our <strong>Safe Meetup Guarantee</strong>. Follow these micro-steps to secure your funds & exchange:
      </p>

      {/* Visual Micro-Steps Flowchart */}
      <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">1. Escrow Protection</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Funds are locked safely in escrow. They are not released to the seller until you approve.</p>
          </div>
        </div>

        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600 shadow-sm">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">2. Inspect in Public</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Meet only in well-lit public swap locations. Inspect the item thoroughly before handoff.</p>
          </div>
        </div>

        <div className="relative flex gap-4 items-start z-10">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-sm">
            <QrCode className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">3. Instantly Unlock</h4>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">Share your secure dynamic QR or PIN with the seller on delivery to securely transfer funds.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeMeetupPanel;
