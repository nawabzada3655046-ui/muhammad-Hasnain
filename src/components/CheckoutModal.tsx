import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  Upload, 
  Trash2, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  Smartphone,
  Truck,
  PackageCheck,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Order } from '../types';
import { STORE_ADDRESS } from '../utils/whatsapp';
import { CustomerProtectionBadges } from './CustomerProtectionBadges';
import { CheckoutCountdownTimer } from './CheckoutCountdownTimer';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, createOrder } = useStore();

  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance'>('advance');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);

  const [copiedJazzcash, setCopiedJazzcash] = useState(false);
  const [copiedEasypaisa, setCopiedEasypaisa] = useState(false);
  const [copiedUBL, setCopiedUBL] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic 3-Day Delivery Timeline calculated automatically from actual order date
  const deliveryTimeline = React.useMemo(() => {
    const today = new Date();
    
    const day0 = new Date(today);
    const day1 = new Date(today);
    day1.setDate(today.getDate() + 1);
    const day2 = new Date(today);
    day2.setDate(today.getDate() + 2);

    const formatFullDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
      });
    };

    return [
      {
        step: 1,
        dayLabel: 'Today',
        formattedDate: formatFullDate(day0),
        statusTitle: 'Dispatched',
        description: 'Order confirmed & prepared for express dispatch',
      },
      {
        step: 2,
        dayLabel: 'Tomorrow',
        formattedDate: formatFullDate(day1),
        statusTitle: 'In Transit / Destination',
        description: 'Courier moving to your destination city hub',
      },
      {
        step: 3,
        dayLabel: 'Day After Tomorrow',
        formattedDate: formatFullDate(day2),
        statusTitle: 'Expected Delivery',
        description: 'Safe doorstep delivery to your location',
      },
    ];
  }, []);

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 5% Advance Payment Discount Calculation
  const isAdvance = paymentMethod === 'advance';
  const discount = isAdvance ? Math.round(subtotal * 0.05) : 0;
  const shippingFee = 0; // Free delivery across Pakistan
  const finalAmount = Math.max(0, subtotal - discount + shippingFee);

  const handleCopy = (text: string, type: 'easypaisa' | 'jazzcash' | 'ubl') => {
    navigator.clipboard.writeText(text);
    if (type === 'easypaisa') {
      setCopiedEasypaisa(true);
      setTimeout(() => setCopiedEasypaisa(false), 2000);
    } else if (type === 'jazzcash') {
      setCopiedJazzcash(true);
      setTimeout(() => setCopiedJazzcash(false), 2000);
    } else {
      setCopiedUBL(true);
      setTimeout(() => setCopiedUBL(false), 2000);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPaymentScreenshot(event.target?.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!contactNumber.trim() || contactNumber.trim().length < 10) {
      setErrorMessage('Please provide a valid Contact Number (e.g. 03432782295).');
      return;
    }
    if (!whatsappNumber.trim() || whatsappNumber.trim().length < 10) {
      setErrorMessage('Please provide a valid WhatsApp Number.');
      return;
    }
    if (!address.trim()) {
      setErrorMessage('Complete Delivery Address is required.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('City is required.');
      return;
    }

    // Advance Payment Screenshot Validation
    if (isAdvance && !paymentScreenshot) {
      setErrorMessage('Please upload your payment screenshot to verify your Advance Payment and claim the 5% discount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const order = createOrder({
        customerName: fullName.trim(),
        contactNumber: contactNumber.trim(),
        whatsappNumber: whatsappNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim() || undefined,
        specialInstructions: specialInstructions.trim() || undefined,
        items: [...cart],
        paymentMethod,
        subtotal,
        discount,
        shippingFee,
        finalAmount,
        paymentScreenshot: isAdvance && paymentScreenshot ? paymentScreenshot : undefined,
      });

      setIsSubmitting(false);
      onOrderSuccess(order);
    } catch {
      setIsSubmitting(false);
      setErrorMessage('Failed to place order. Please try again or order directly via WhatsApp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-xl sm:text-2xl text-gray-900">
                Complete Your Order
              </h2>
              <p className="text-xs text-gray-500">
                Hasnain Zarri Chappal Store • {STORE_ADDRESS}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white hover:bg-gray-200 text-gray-500 hover:text-gray-900 border border-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 24-Hour Special Offer Countdown Timer */}
        <CheckoutCountdownTimer />

        {/* Form Body */}
        <form onSubmit={handleSubmitOrder} className="p-5 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 3-Day Delivery Timeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-amber-50/70 border border-amber-200/90 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                    3-Day Delivery Timeline
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Live schedule calculated from your actual order date
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Free Express Delivery
              </span>
            </div>

            {/* Timeline Steps with Connecting Line */}
            <div className="relative">
              {/* Connecting Line (desktop/tablet) */}
              <div 
                className="hidden sm:block absolute top-5 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 z-0" 
                aria-hidden="true"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
                {deliveryTimeline.map((item, idx) => (
                  <div
                    key={item.step}
                    className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2.5 p-3 sm:p-3.5 rounded-xl border transition-all ${
                      idx === 0
                        ? 'bg-amber-500/10 border-amber-300 shadow-2xs'
                        : idx === 2
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : 'bg-white/90 border-gray-200'
                    }`}
                  >
                    {/* Step Icon with Number Badge */}
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 shadow-xs ${
                        idx === 0
                          ? 'bg-amber-500 border-amber-600 text-white'
                          : idx === 1
                          ? 'bg-white border-amber-500 text-amber-700'
                          : 'bg-white border-emerald-500 text-emerald-700'
                      }`}>
                        {idx === 0 && <PackageCheck className="w-5 h-5" />}
                        {idx === 1 && <Truck className="w-5 h-5" />}
                        {idx === 2 && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                        {item.step}
                      </span>
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 sm:w-full min-w-0">
                      <div className="flex sm:flex-col items-baseline sm:items-center justify-between sm:justify-center gap-0.5">
                        <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                          {item.dayLabel}
                        </span>
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 font-mono block">
                          {item.formattedDate}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                        {item.statusTitle}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 1: Customer Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">1</span>
              Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Bilal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03001234567"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03432782295"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  We send order tracking & dispatch updates on this WhatsApp.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore, Karachi, Rawalpindi, Peshawar, Quetta"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House / Flat #, Street #, Mohallah / Sector / Area name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors resize-none shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 54000"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security, call before coming"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 transition-colors shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">2</span>
              Payment Method
            </h3>

            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Advance Payment Option (Highlighted with 5% discount) */}
              <div
                onClick={() => setPaymentMethod('advance')}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isAdvance
                    ? 'bg-amber-50/70 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="absolute top-3 right-3">
                  <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs uppercase">
                    Save 5% OFF
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isAdvance ? 'border-amber-600 bg-amber-500' : 'border-gray-400'
                  }`}>
                    {isAdvance && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Advance Payment</h4>
                    <span className="text-xs text-amber-700 font-bold block">
                      Get 5% OFF when you pay in advance
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 mt-2.5">
                  JazzCash, Easypaisa or UBL Bank transfer. Instant verification via screenshot.
                </p>
              </div>

              {/* Cash on Delivery Option */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  !isAdvance
                    ? 'bg-amber-50/70 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    !isAdvance ? 'border-amber-600 bg-amber-500' : 'border-gray-400'
                  }`}>
                    {!isAdvance && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">Cash on Delivery (COD)</h4>
                    <span className="text-xs text-gray-500 block">
                      Pay cash to courier rider at doorstep
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 mt-2.5">
                  Standard checkout across Pakistan. No advance transfer required.
                </p>
              </div>

            </div>

            {/* Advance Payment Details Section (JazzCash, Easypaisa & UBL Bank) */}
            {isAdvance && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                  <Sparkles className="w-4 h-4 fill-amber-500" />
                  <span>Transfer Amount & Bank Details</span>
                </div>

                <p className="text-xs text-gray-700">
                  Please transfer the discounted amount of <strong className="text-amber-800 font-mono text-sm">Rs. {finalAmount.toLocaleString()}</strong> to any account below and upload your payment screenshot:
                </p>

                {/* Account Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* JazzCash */}
                  <div className="p-3.5 rounded-xl bg-white border border-red-300 flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-red-700 font-bold text-xs uppercase">
                        <Smartphone className="w-4 h-4 text-red-600" />
                        <span>JazzCash</span>
                      </div>
                      <div className="text-sm font-mono font-extrabold text-gray-900">
                        03048539583
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium block">Title: Muhammad Hasnain</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy('03048539583', 'jazzcash')}
                      className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-red-200 cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedJazzcash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedJazzcash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Easypaisa */}
                  <div className="p-3.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs uppercase">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>Easypaisa</span>
                      </div>
                      <div className="text-sm font-mono font-extrabold text-gray-900">
                        03432782295
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium block">Title: Muhammad Hasnain</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy('03432782295', 'easypaisa')}
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-emerald-200 cursor-pointer"
                      title="Copy Number"
                    >
                      {copiedEasypaisa ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEasypaisa ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* UBL Bank */}
                  <div className="p-3.5 rounded-xl bg-white border border-blue-300 flex items-center justify-between shadow-xs sm:col-span-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs uppercase">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>UBL Bank Account</span>
                      </div>
                      <div className="text-sm font-mono font-extrabold text-gray-900">
                        0564327905374
                      </div>
                      <span className="text-[10px] text-gray-600 font-medium block">Title: Muhammad Hasnain</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy('0564327905374', 'ubl')}
                      className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-blue-200 cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedUBL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUBL ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                </div>

                {/* Screenshot Upload Requirement */}
                <div className="space-y-2 pt-2 border-t border-amber-200/80">
                  <label className="text-xs font-bold text-gray-800 block">
                    Upload Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-gray-600">
                    Please transfer the required amount and upload your payment screenshot below.
                  </p>

                  {paymentScreenshot ? (
                    <div className="p-3 rounded-xl bg-white border border-emerald-300 flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={paymentScreenshot}
                          alt="Payment Screenshot Preview"
                          className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                        />
                        <div>
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Screenshot Attached
                          </span>
                          <span className="text-[10px] text-gray-500 block">
                            Ready to attach to your order
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer text-xs text-amber-700 underline font-semibold px-2 py-1">
                          Change
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setPaymentScreenshot(null)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Remove screenshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 hover:border-amber-500 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-amber-50/30 transition-all group shadow-2xs">
                      <Upload className="w-8 h-8 text-amber-600 group-hover:scale-110 transition-transform mb-2" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-800">
                        Click to select image from phone / computer
                      </span>
                      <span className="text-[11px] text-gray-500 mt-1">
                        PNG, JPG, JPEG or WEBP (Max 10MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Section 3: Order Summary & Discount Calculation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
              Order Calculation Summary
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Product Total ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-mono text-gray-900 font-semibold">Rs. {subtotal.toLocaleString()}</span>
              </div>

              {isAdvance && (
                <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Advance Payment Discount (5% OFF)
                  </span>
                  <span className="font-mono font-bold">- Rs. {discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-700">
                <span>Doorstep Delivery Across Pakistan</span>
                <span className="text-emerald-700 font-bold uppercase text-xs">FREE</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-bold text-gray-900 font-serif-luxury block">Final Total</span>
                  {isAdvance && (
                    <span className="text-[11px] text-amber-700 font-medium">5% discount applied automatically</span>
                  )}
                </div>
                <span className="text-2xl font-extrabold text-amber-700 font-mono">
                  Rs. {finalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Protection Badges */}
          <CustomerProtectionBadges variant="checkout" />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-extrabold text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Placing Order...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Confirm & Place Order (Rs. {finalAmount.toLocaleString()})</span>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
