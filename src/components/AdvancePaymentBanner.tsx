import React, { useState } from 'react';
import { Sparkles, Smartphone, Building2, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface AdvancePaymentBannerProps {
  onShopNow: () => void;
}

export const AdvancePaymentBanner: React.FC<AdvancePaymentBannerProps> = ({ onShopNow }) => {
  const [copiedJazzcash, setCopiedJazzcash] = useState(false);
  const [copiedEasypaisa, setCopiedEasypaisa] = useState(false);
  const [copiedUBL, setCopiedUBL] = useState(false);

  const copyNumber = (text: string, type: 'jazzcash' | 'ep' | 'ubl') => {
    navigator.clipboard.writeText(text);
    if (type === 'jazzcash') {
      setCopiedJazzcash(true);
      setTimeout(() => setCopiedJazzcash(false), 2000);
    } else if (type === 'ep') {
      setCopiedEasypaisa(true);
      setTimeout(() => setCopiedEasypaisa(false), 2000);
    } else {
      setCopiedUBL(true);
      setTimeout(() => setCopiedUBL(false), 2000);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 border border-amber-300 p-6 sm:p-10 lg:p-12 shadow-lg">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Offer Details */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>Special Customer Privilege</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold font-serif-luxury text-gray-900">
                Get <span className="text-amber-700">5% Instant OFF</span> When You Pay in Advance
              </h2>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal max-w-xl">
                Skip courier handling delays! Transfer via JazzCash, Easypaisa, or UBL Bank at checkout to automatically enjoy 5% savings on your entire order amount.
              </p>

              {/* Example calculation card */}
              <div className="p-4 rounded-xl bg-white border border-gray-200 max-w-md mx-auto lg:mx-0 text-xs sm:text-sm text-gray-700 space-y-1.5 font-mono shadow-xs">
                <div className="flex justify-between">
                  <span>Product Total:</span>
                  <span className="text-gray-900 font-bold">Rs. 2,000</span>
                </div>
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Advance Payment Discount (5%):</span>
                  <span>- Rs. 100</span>
                </div>
                <div className="flex justify-between text-gray-900 font-extrabold pt-1 border-t border-gray-200 text-base">
                  <span>Final Total:</span>
                  <span className="text-emerald-700">Rs. 1,900</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onShopNow}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm uppercase tracking-wider shadow-md transition-transform hover:scale-105 cursor-pointer"
                >
                  <span>Claim Your Discount</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Right Column: Account Details Box */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-md">
                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Verified Store Accounts (Title: Muhammad Hasnain)
                </h4>

                {/* JazzCash */}
                <div className="p-3 rounded-xl bg-red-50/60 border border-red-300 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-red-800 text-xs font-bold uppercase">
                      <Smartphone className="w-4 h-4 text-red-600" />
                      <span>JazzCash Account</span>
                    </div>
                    <div className="text-base font-mono font-extrabold text-gray-900 mt-0.5">
                      03048539583
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">Title: Muhammad Hasnain</span>
                  </div>

                  <button
                    onClick={() => copyNumber('03048539583', 'jazzcash')}
                    className="py-1.5 px-3 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedJazzcash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJazzcash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Easypaisa */}
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-300 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Easypaisa Account</span>
                    </div>
                    <div className="text-base font-mono font-extrabold text-gray-900 mt-0.5">
                      03432782295
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">Title: Muhammad Hasnain</span>
                  </div>

                  <button
                    onClick={() => copyNumber('03432782295', 'ep')}
                    className="py-1.5 px-3 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedEasypaisa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedEasypaisa ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* UBL Bank */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-300 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-blue-800 text-xs font-bold uppercase">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>UBL Bank Account</span>
                    </div>
                    <div className="text-base font-mono font-extrabold text-gray-900 mt-0.5">
                      0564327905374
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium">Title: Muhammad Hasnain</span>
                  </div>

                  <button
                    onClick={() => copyNumber('0564327905374', 'ubl')}
                    className="py-1.5 px-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedUBL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUBL ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed text-center pt-1">
                  Upload screenshot directly during checkout to complete verified order.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
