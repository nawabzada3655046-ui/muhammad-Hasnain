import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

interface CustomerProtectionBadgesProps {
  variant?: 'checkout' | 'confirmation';
  className?: string;
}

export const CustomerProtectionBadges: React.FC<CustomerProtectionBadgesProps> = ({
  variant = 'checkout',
  className = '',
}) => {
  const policies = [
    {
      emoji: '📦',
      title: 'Allowed to Open Parcel',
      description: 'Customer can open and check the parcel before accepting it.',
      badgeText: 'Check Before Accepting',
    },
    {
      emoji: '🔄',
      title: '7 Days Return',
      description: "Customer can return the product within 7 days according to the store's return policy.",
      badgeText: '7-Day Easy Returns',
    },
    {
      emoji: '💰',
      title: 'Full Payment Refund',
      description: "Eligible returned orders receive a full payment refund according to the store's return policy.",
      badgeText: '100% Money-Back',
    },
  ];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-amber-50/90 via-amber-100/30 to-amber-50/70 border border-amber-200/90 p-4 sm:p-5 shadow-2xs ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Customer Protection Guarantee</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </h4>
            <p className="text-[11px] text-gray-600">
              {variant === 'confirmation'
                ? 'Your order is backed by our customer-friendly purchase guarantees'
                : 'Shop with 100% confidence & verified artisan trust'}
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-300/80 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
          Store Policy Verified
        </span>
      </div>

      {/* 3 Badges / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
        {policies.map((policy, idx) => (
          <div
            key={idx}
            className="p-3 sm:p-3.5 rounded-xl bg-white border border-amber-200/80 hover:border-amber-400 transition-all shadow-2xs flex sm:flex-col items-start gap-3 sm:gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 group-hover:bg-amber-100/60 transition-transform">
              <span>{policy.emoji}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-xs sm:text-[13px] font-extrabold text-gray-900 block leading-tight">
                  {policy.title}
                </span>
              </div>
              <span className="inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 mb-1">
                {policy.badgeText}
              </span>
              <p className="text-[11px] text-gray-600 leading-snug">
                {policy.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
