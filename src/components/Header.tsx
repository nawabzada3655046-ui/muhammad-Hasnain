import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  MessageCircle, 
  Sparkles,
  Lock
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { STORE_WHATSAPP_NUMBER, getGeneralWhatsAppUrl } from '../utils/whatsapp';
import { TikTokIcon } from './icons/TikTokIcon';
import { TIKTOK_PROFILE_URL } from '../utils/socialLinks';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onNavigateCategory: (category: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAdmin,
  onNavigateCategory,
  onScrollToSection,
}) => {
  const { cart, searchQuery, setSearchQuery, isAdmin } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleNavClick = (categoryName?: string, sectionId?: string) => {
    setMobileMenuOpen(false);
    if (categoryName) {
      onNavigateCategory(categoryName);
    } else if (sectionId) {
      onScrollToSection(sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-amber-500 text-white py-1.5 px-4 text-xs font-semibold tracking-wide shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Sparkles className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>Get Extra <strong>5% OFF</strong> on Advance Payment (JazzCash / Easypaisa / UBL Bank) • Delivery Across Pakistan</span>
            <span className="hidden md:inline">• WhatsApp Order: <strong>{STORE_WHATSAPP_NUMBER}</strong></span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] shrink-0">
            <a
              href={TIKTOK_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white/95 hover:text-white hover:underline transition-colors font-bold"
              title="Official TikTok Profile (@zarri.chappal.pk)"
            >
              <TikTokIcon className="w-3.5 h-3.5 fill-white" />
              <span>Follow Us on TikTok</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick(undefined, 'hero')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-0.5 shadow-md shadow-amber-500/20 group-hover:shadow-amber-500/30 transition-all">
              <div className="w-full h-full bg-white rounded-[7px] flex items-center justify-center text-amber-700 font-serif-luxury font-extrabold text-xl border border-amber-200">
                HZ
              </div>
            </div>
            <div>
              <span className="font-serif-luxury text-lg sm:text-2xl font-bold tracking-wider text-gray-900 block group-hover:text-amber-700 transition-colors">
                Hasnain Zarri
              </span>
              <span className="text-[10px] sm:text-xs tracking-[0.25em] text-amber-600 uppercase font-bold block">
                Chappal Store
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-gray-700">
            <button 
              onClick={() => handleNavClick(undefined, 'hero')}
              className="hover:text-amber-600 transition-colors py-1 hover:border-b-2 hover:border-amber-600 font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => handleNavClick("Men's Chappal")}
              className="hover:text-amber-600 transition-colors py-1 hover:border-b-2 hover:border-amber-600 font-medium"
            >
              Men
            </button>
            <button 
              onClick={() => handleNavClick("Women's Khussa")}
              className="hover:text-amber-600 transition-colors py-1 hover:border-b-2 hover:border-amber-600 font-medium"
            >
              Women
            </button>
            <button 
              onClick={() => handleNavClick("New Arrivals")}
              className="hover:text-amber-600 transition-colors py-1 hover:border-b-2 hover:border-amber-600 flex items-center gap-1.5 text-amber-700 font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              New Arrivals
            </button>
            <button 
              onClick={() => handleNavClick("All Products")}
              className="hover:text-amber-600 transition-colors py-1 hover:border-b-2 hover:border-amber-600 font-medium"
            >
              All Products
            </button>
            <button 
              onClick={() => handleNavClick(undefined, 'contact')}
              className="hover:text-amber-600 transition-colors py-1 hover:border-b-2 hover:border-amber-600 font-medium"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Icons & WhatsApp Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Toggle */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-gray-50 border border-gray-300 focus-within:border-amber-500 rounded-full px-3 py-1.5 text-sm transition-all w-48 sm:w-64 shadow-inner">
                  <Search className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search Chappal, Khussa..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="bg-transparent text-gray-900 placeholder-gray-400 text-xs sm:text-sm focus:outline-none w-full"
                  />
                  <button 
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    className="text-gray-400 hover:text-gray-700 ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search products"
                  className="p-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              aria-label="View Shopping Cart"
              className="relative p-2.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white font-extrabold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Official TikTok Profile Button (Desktop) */}
            <a
              href={TIKTOK_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs hover:scale-105 border border-black/20"
              title="Follow Hasnain Zarri Chappal Store on TikTok (@zarri.chappal.pk)"
            >
              <TikTokIcon className="w-3.5 h-3.5 fill-white" />
              <span>Follow Us on TikTok</span>
            </a>

            {/* Direct WhatsApp Order CTA Button */}
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-full shadow-md shadow-green-600/20 transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp Order</span>
            </a>

            {/* Admin Dashboard Entry */}
            <button
              onClick={onOpenAdmin}
              title={isAdmin ? "Open Admin Dashboard (Logged In)" : "Admin Login"}
              className={`p-2.5 rounded-full border transition-all ${
                isAdmin 
                  ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100" 
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:text-amber-600 hover:border-amber-300"
              }`}
            >
              <Lock className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 hover:text-amber-600 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-6 space-y-4 animate-in slide-in-from-top duration-200 shadow-xl">
          <div className="flex flex-col space-y-2 font-medium text-base text-gray-800">
            <button
              onClick={() => handleNavClick(undefined, 'hero')}
              className="text-left py-2 px-3 rounded-lg hover:bg-amber-50 hover:text-amber-700"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick("Men's Chappal")}
              className="text-left py-2 px-3 rounded-lg hover:bg-amber-50 hover:text-amber-700"
            >
              Men's Chappal & Khussa
            </button>
            <button
              onClick={() => handleNavClick("Women's Khussa")}
              className="text-left py-2 px-3 rounded-lg hover:bg-amber-50 hover:text-amber-700"
            >
              Women's Chappal & Khussa
            </button>
            <button
              onClick={() => handleNavClick("New Arrivals")}
              className="text-left py-2 px-3 rounded-lg hover:bg-amber-50 text-amber-700 font-bold flex items-center justify-between"
            >
              <span>New Arrivals</span>
              <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">New</span>
            </button>
            <button
              onClick={() => handleNavClick("All Products")}
              className="text-left py-2 px-3 rounded-lg hover:bg-amber-50 hover:text-amber-700"
            >
              All Products Catalog
            </button>
            <button
              onClick={() => handleNavClick(undefined, 'contact')}
              className="text-left py-2 px-3 rounded-lg hover:bg-amber-50 hover:text-amber-700"
            >
              Contact & Store Location
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-2.5">
            {/* Direct WhatsApp Order CTA Button */}
            <a
              href={getGeneralWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-2.5 rounded-xl shadow-sm text-sm"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>Direct WhatsApp Order (03432782295)</span>
            </a>

            {/* Official TikTok Profile Button (Mobile) */}
            <a
              href={TIKTOK_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-black hover:bg-neutral-900 text-white font-bold py-2.5 rounded-xl shadow-sm text-sm transition-all"
            >
              <TikTokIcon className="w-4 h-4 fill-white" />
              <span>Follow Us on TikTok</span>
            </a>

            <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-1">
              <span>Delivery Across Pakistan</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="text-amber-700 font-semibold underline"
              >
                {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
