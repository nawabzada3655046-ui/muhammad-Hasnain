import React from 'react';
import { 
  Award, 
  MessageCircle, 
  Truck, 
  Percent, 
  MapPin, 
  PackageCheck,
  Sparkles
} from 'lucide-react';
import { STORE_WHATSAPP_NUMBER } from '../utils/whatsapp';

export const WhyChooseUs: React.FC = () => {
  const trustPoints = [
    {
      icon: Award,
      title: 'Premium Quality Footwear',
      description: 'Handcrafted with 100% genuine cowhide leather, authentic tilla Zarri embroidery, and ergonomic comfort insoles.',
    },
    {
      icon: MessageCircle,
      title: 'Easy WhatsApp Ordering',
      description: `One-click booking directly with our store at ${STORE_WHATSAPP_NUMBER}. Instant sizing consultation & fast confirmations.`,
    },
    {
      icon: PackageCheck,
      title: 'ALLOWED TO OPEN PARCEL',
      description: 'Order with zero worries—you are completely allowed to open and inspect your parcel before paying the courier rider across Pakistan.',
    },
    {
      icon: Percent,
      title: 'Advance Payment Discount',
      description: 'Get an instant 5% OFF on your entire order when paying via JazzCash, Easypaisa, or UBL Bank transfer.',
    },
    {
      icon: MapPin,
      title: 'Delivery Across Pakistan',
      description: 'From Karachi to Khyber, Lahore, Islamabad, Quetta, Peshawar, and every town—fast safe courier delivery.',
    },
    {
      icon: PackageCheck,
      title: 'Carefully Packed Orders',
      description: 'Every pair is individually wrapped in protective cloth pouches inside our signature luxury presentation box.',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white border-y border-gray-200 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-100/30 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            <span>Why Hasnain Zarri Chappal Store</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold font-serif-luxury text-gray-900">
            Rooted in Tradition, Built for Pure Distinction
          </h2>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
            Every stitch reflects generations of Peshawar & Khyber artisanal mastery. We bring royal Pakistani footwear directly from our master workshop to your door.
          </p>
        </div>

        {/* 6 Trust Points Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {trustPoints.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gray-50/70 border border-gray-200 hover:border-amber-400 hover:bg-white hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 mb-4">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>

                <h3 className="font-serif-luxury font-bold text-lg text-gray-900 group-hover:text-amber-700 transition-colors mb-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
