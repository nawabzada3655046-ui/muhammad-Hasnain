import React from 'react';
import { MessageCircle, ArrowRight, Award, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { STORE_WHATSAPP_NUMBER, getGeneralWhatsAppUrl } from '../utils/whatsapp';

interface HeroBannerProps {
  onShopNow: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onShopNow }) => {
  const { bannerConfig } = useStore();

  return (
    <div id="hero" className="relative overflow-hidden bg-gradient-to-b from-amber-50/50 via-white to-white border-b border-gray-200">
      {/* Background warm subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-100/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Heritage Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs sm:text-sm font-semibold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              <span>Authentic Pakistani Handcrafted Footwear</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif-luxury tracking-tight text-gray-900 leading-tight">
              {bannerConfig.heroTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-amber-700 font-semibold tracking-wide">
              {bannerConfig.heroSubtitle}
            </p>

            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Experience the pinnacle of Pakistani traditional artistry. Meticulously handcrafted by master artisans using genuine leather, pure golden Zarri tilla thread, and double-cushioned comfort soles.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onShopNow}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>

              <a
                href={getGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-base shadow-lg shadow-green-600/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Order on WhatsApp</span>
              </a>
            </div>

            {/* Mini Trust Badges */}
            <div className="pt-6 border-t border-gray-200 grid grid-cols-3 gap-4 text-center sm:text-left">
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-700 font-bold text-xs sm:text-sm">
                  <Award className="w-4 h-4" />
                  <span>100% Genuine</span>
                </div>
                <p className="text-[11px] text-gray-500">Pure Cow Leather</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-700 font-bold text-xs sm:text-sm">
                  <Truck className="w-4 h-4" />
                  <span>All Pakistan</span>
                </div>
                <p className="text-[11px] text-gray-500">Fast Doorstep Delivery</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-amber-700 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>COD & Advance</span>
                </div>
                <p className="text-[11px] text-gray-500">5% OFF on Advance</p>
              </div>
            </div>

          </div>

          {/* Right Visual Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Subtle gold gradient frame */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 rounded-2xl opacity-40 blur-xs transition duration-1000" />
              
              <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xl">
                <img
                  src={bannerConfig.heroImage}
                  alt="Premium Handcrafted Zarri Chappal & Khussa"
                  className="w-full h-80 sm:h-[440px] object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />

                {/* Floating badge on image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-gray-200 p-3.5 rounded-xl flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-amber-600 font-bold block">Hasnain Exclusive</span>
                    <span className="text-sm font-bold text-gray-900 font-serif-luxury">Double Sole Zarri Peshawari</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 line-through">Rs. 4,200</span>
                    <span className="text-sm font-extrabold text-amber-600 block">Rs. 3,450</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
