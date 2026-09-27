import React from 'react';
import { MessageCircle, PhoneCall, Clock, CheckCircle } from 'lucide-react';
import { STORE_WHATSAPP_NUMBER, getGeneralWhatsAppUrl } from '../utils/whatsapp';

export const WhatsAppCTA: React.FC = () => {
  return (
    <>
      {/* Floating WhatsApp Action Button (bottom right) */}
      <aside 
        aria-label="Contact options"
        className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 group"
      >
        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white border border-gray-200 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-lg">
          Order / Inquire on WhatsApp
        </div>

        <a
          href={getGeneralWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-green-600/30 transition-transform duration-300 hover:scale-110 active:scale-95"
          aria-label="Direct WhatsApp Order"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white animate-ping" />
          <MessageCircle className="w-7 h-7 fill-white" />
        </a>
      </aside>

      {/* Section CTA on homepage */}
      <section className="py-14 sm:py-18 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs uppercase tracking-wider">
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Direct WhatsApp Ordering Available</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif-luxury text-gray-900">
            Need Custom Sizing or Urgent Eid & Wedding Order?
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our master shoemakers are available on WhatsApp to assist you with exact foot sizing, custom color requests, and bulk wedding orders across Pakistan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={getGeneralWhatsAppUrl('Assalam-o-Alaikum Hasnain Zarri Chappal Store! I need assistance with sizing and placing an order.')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-base shadow-lg shadow-green-600/30 hover:scale-105 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Chat with Us on WhatsApp ({STORE_WHATSAPP_NUMBER})</span>
            </a>

            <a
              href={`tel:${STORE_WHATSAPP_NUMBER}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold text-sm transition-colors shadow-xs"
            >
              <PhoneCall className="w-4 h-4 text-amber-600" />
              <span>Call: {STORE_WHATSAPP_NUMBER}</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 pt-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Response time: Under 10 minutes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Open 7 Days a Week
            </span>
          </div>
        </div>
      </section>
    </>
  );
};
