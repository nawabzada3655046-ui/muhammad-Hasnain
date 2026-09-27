import React from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { STORE_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const PolicyModals: React.FC<PolicyModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              {type === 'privacy' ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <h3 className="font-serif-luxury font-bold text-lg text-gray-900">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm text-gray-700 max-h-[70vh] overflow-y-auto leading-relaxed">
          {type === 'privacy' ? (
            <>
              <p>
                At <strong>Hasnain Zarri Chappal Store</strong>, we value the trust you place in us when sharing your personal information. This Privacy Policy describes how we collect, use, and protect your information when you browse our website or place an order.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">1. Information We Collect</h4>
              <p>
                When you place an order, we collect your Full Name, Contact Number, WhatsApp Number, and Complete Delivery Address to ensure accurate fulfillment and courier delivery across Pakistan.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">2. Advance Payment Proof</h4>
              <p>
                If you select Advance Payment (Easypaisa / UBL Bank), the payment screenshot uploaded by you is exclusively used to verify your transaction and apply the 5% discount before dispatch.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">3. Order Updates via WhatsApp</h4>
              <p>
                We use your WhatsApp number to share order booking confirmations, dispatch tracking numbers, and delivery notifications. We never sell or share your phone numbers with third-party advertisers.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">4. Contact Us</h4>
              <p>
                For any privacy questions or updates, reach out to us directly on WhatsApp at <strong>{STORE_WHATSAPP_NUMBER}</strong>.
              </p>
            </>
          ) : (
            <>
              <p>
                Welcome to <strong>Hasnain Zarri Chappal Store</strong>. By accessing our website and placing orders, you agree to the following terms and guidelines.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">1. Handcrafted Authenticity</h4>
              <p>
                Our Zarri Chappals and Khussas are handcrafted by master artisans. Subtle natural variations in leather texture, grain, and zari embroidery tilla are hallmarks of genuine handmade craftsmanship.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">2. Pricing & 5% Advance Payment Discount</h4>
              <p>
                All prices are listed in Pakistani Rupees (PKR). Customers choosing Advance Payment via Easypaisa or UBL Bank receive an immediate 5% discount calculated automatically upon checkout.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">3. Delivery Across Pakistan</h4>
              <p>
                Standard courier delivery takes 2 to 4 working days to major cities (Karachi, Lahore, Rawalpindi/Islamabad, Peshawar, Multan, Faisalabad, Quetta) and 3 to 6 days for remote areas.
              </p>
              <h4 className="font-bold text-amber-800 text-sm">4. Size Exchange Policy</h4>
              <p>
                We want you to wear footwear that fits like royalty! If you need a size exchange, simply notify us on WhatsApp ({STORE_WHATSAPP_NUMBER}) within 7 days of receiving your parcel. The shoes must be unworn and in original condition.
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
