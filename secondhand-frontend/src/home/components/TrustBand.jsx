import React from 'react';
import { ShieldCheck, CreditCard, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Verified Sellers',
    description: 'Every seller is verified through our multi-step process.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Your payment is held safely until you confirm delivery.',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Not satisfied? Return within 14 days, no questions asked.',
  },
];

const TrustBand = () => {
  return (
    <section className="border-t border-gray-100 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBand;
