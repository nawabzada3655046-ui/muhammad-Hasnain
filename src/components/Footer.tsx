import React from 'react';
import { 
  MessageCircle, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Youtube,
  ExternalLink
} from 'lucide-react';
import { STORE_WHATSAPP_NUMBER, STORE_ADDRESS, getGeneralWhatsAppUrl } from '../utils/whatsapp';
import { TikTokIcon } from './icons/TikTokIcon';
import { TIKTOK_PROFILE_URL } from '../utils/socialLinks';

interface FooterProps {
  onNavigateCategory: (category: string) => void;
  onScrollToSection: (sectionId: string) => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateCategory,
  onScrollToSection,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  return (
    <footer id="contact" className="bg-gray-100 border-t border-gray-200 text-gray-700">
      
      {/* Upper Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-sm">
                <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center text-amber-700 font-serif-luxury font-bold text-lg">
                  HZ
                </div>
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl font-bold tracking-wider text-gray-900">
                  Hasnain Zarri Chappal Store
                </h3>
                <span className="text-[10px] tracking-[0.2em] text-amber-700 uppercase font-semibold block">
                  Peshawar & Traditional Footwear
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-normal pr-4">
              Hasnain Zarri Chappal Store is Pakistan's premier destination for pure leather handcrafted Zarri Chappals, double-sole Peshawari footwear, and royal embroidered khussa shoes. Delivering heritage quality to your doorstep across Pakistan.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>WhatsApp: <strong className="text-gray-900 font-mono">{STORE_WHATSAPP_NUMBER}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Helpline: <strong className="text-gray-900 font-mono">{STORE_WHATSAPP_NUMBER}</strong></span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{STORE_ADDRESS}</span>
              </div>
            </div>

            {/* Prominent Action Button: Follow Us on TikTok */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <a
                href={TIKTOK_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-xs hover:scale-105 transition-all border border-black/20"
                title="Follow Hasnain Zarri Chappal Store on TikTok (@zarri.chappal.pk)"
              >
                <TikTokIcon className="w-4 h-4 fill-white" />
                <span>Follow Us on TikTok</span>
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href={TIKTOK_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-black hover:bg-neutral-800 text-white flex items-center justify-center transition-all shadow-2xs hover:scale-110"
                aria-label="Official TikTok Profile"
                title="Follow Us on TikTok (@zarri.chappal.pk)"
              >
                <TikTokIcon className="w-4 h-4 fill-white" />
              </a>
              <a
                href={getGeneralWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white hover:bg-[#25D366] text-gray-600 hover:text-white flex items-center justify-center transition-colors border border-gray-300 shadow-2xs"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white hover:bg-[#1877F2] text-gray-600 hover:text-white flex items-center justify-center transition-colors border border-gray-300 shadow-2xs"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white hover:bg-[#E4405F] text-gray-600 hover:text-white flex items-center justify-center transition-colors border border-gray-300 shadow-2xs"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white hover:bg-[#FF0000] text-gray-600 hover:text-white flex items-center justify-center transition-colors border border-gray-300 shadow-2xs"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-gray-900 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onScrollToSection('hero')}
                  className="hover:text-amber-700 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('All Products')}
                  className="hover:text-amber-700 transition-colors"
                >
                  Products Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory("Men's Chappal")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Men's Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory("Women's Khussa")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Women's Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory('New Arrivals')}
                  className="hover:text-amber-700 transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onScrollToSection('contact')}
                  className="hover:text-amber-700 transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Footwear Categories */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-gray-900 uppercase tracking-wider">
              Handcrafted Footwear
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateCategory("Men's Chappal")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Golden Zarri Peshawari
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory("Men's Chappal")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Traditional Double Sole
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory("Men's Chappal")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Balochi Norozi Chappal
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory("Men's Khussa")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Royal Groom Sherwani Khussa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory("Women's Khussa")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Bridal Velvet Dabka Khussa
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateCategory("Women's Chappal")}
                  className="hover:text-amber-700 transition-colors"
                >
                  Women Zarri Kolhapuri
                </button>
              </li>
            </ul>
          </div>

          {/* Legal, Payment & Policies */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-gray-900 uppercase tracking-wider">
              Customer Care & Policy
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={onOpenPrivacy} className="hover:text-amber-700 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onOpenTerms} className="hover:text-amber-700 transition-colors">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <a 
                  href={getGeneralWhatsAppUrl('Assalam-o-Alaikum, I need help with size exchange policy.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-700 transition-colors"
                >
                  Size Exchange Policy
                </a>
              </li>
              <li>
                <a 
                  href={getGeneralWhatsAppUrl('Assalam-o-Alaikum, I want to track my order.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-700 transition-colors"
                >
                  Track Your Order
                </a>
              </li>
              <li>
                <a 
                  href={getGeneralWhatsAppUrl('Assalam-o-Alaikum, I want to inquire about bulk wedding / wholesale orders.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-700 transition-colors"
                >
                  Wholesale & Wedding Inquiries
                </a>
              </li>
              <li className="pt-1 border-t border-gray-200">
                <a 
                  href={TIKTOK_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-700 transition-colors flex items-center gap-1 font-bold text-gray-900"
                  title="Follow on TikTok: @zarri.chappal.pk"
                >
                  <TikTokIcon className="w-3.5 h-3.5 fill-black" />
                  <span>TikTok (@zarri.chappal.pk)</span>
                  <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                </a>
              </li>
            </ul>

            {/* Payment badges */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                Accepted Payment Methods:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                <span className="px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-300">
                  JazzCash (5% OFF)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                  Easypaisa (5% OFF)
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-300">
                  UBL Bank (5% OFF)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                  Cash on Delivery (COD)
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-200 bg-gray-50 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} <strong className="text-gray-900">Hasnain Zarri Chappal Store</strong>. All Rights Reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-amber-700 font-semibold">WhatsApp: {STORE_WHATSAPP_NUMBER}</span>
            <span>•</span>
            <span>Delivery Across All Cities of Pakistan</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
