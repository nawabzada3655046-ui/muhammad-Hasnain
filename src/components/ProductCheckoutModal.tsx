import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  PackageCheck, 
  Truck, 
  CheckCircle2, 
  MessageCircle, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Minus, 
  Copy, 
  Check, 
  Upload, 
  Trash2, 
  Building2, 
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Order } from '../types';
import { 
  STORE_ADDRESS, 
  STORE_WHATSAPP_NUMBER, 
  STORE_WHATSAPP_INT,
  getOrderWhatsAppUrl 
} from '../utils/whatsapp';
import { CustomerProtectionBadges } from './CustomerProtectionBadges';
import { CheckoutCountdownTimer } from './CheckoutCountdownTimer';

interface ProductCheckoutModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const ProductCheckoutModal: React.FC<ProductCheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { createOrder } = useStore();

  // Selected Product Configuration
  const [selectedSize, setSelectedSize] = useState<string | number>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Customer Form Fields (Requirements: Full Name, Mobile Number, Complete Delivery Address, City, Shoe Size, Quantity)
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Payment Selection: COD or Advance Payment (5% OFF)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance'>('cod');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedJazzcash, setCopiedJazzcash] = useState(false);
  const [copiedEasypaisa, setCopiedEasypaisa] = useState(false);
  const [copiedUBL, setCopiedUBL] = useState(false);

  // When product changes or modal opens, initialize default size and quantity
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize('Standard');
      }
      setQuantity(1);
      setErrorMessage('');
    }
  }, [product, isOpen]);

  // Dynamic 3-Day Delivery Timeline
  const deliveryTimeline = useMemo(() => {
    const today = new Date();
    const day0 = new Date(today);
    const day1 = new Date(today);
    day1.setDate(today.getDate() + 1);
    const day2 = new Date(today);
    day2.setDate(today.getDate() + 2);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    return [
      { step: 1, label: 'Today', date: formatDate(day0), title: 'Packed & Dispatched' },
      { step: 2, label: 'Tomorrow', date: formatDate(day1), title: 'In Transit' },
      { step: 3, label: 'Day 3', date: formatDate(day2), title: 'Doorstep Delivery' },
    ];
  }, []);

  if (!isOpen || !product) return null;

  // Calculation Summary
  const unitPrice = product.price;
  const subtotal = unitPrice * quantity;
  const isAdvance = paymentMethod === 'advance';
  const discount = isAdvance ? Math.round(subtotal * 0.05) : 0;
  const shippingFee = 0; // 100% Free delivery across Pakistan
  const finalAmount = Math.max(0, subtotal - discount + shippingFee);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Validate Customer Full Name
    if (!fullName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }

    // 2. Validate Mobile Number
    const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 11-digit Mobile Number (e.g. 03432782295).');
      return;
    }

    // 3. Validate Complete Delivery Address
    if (!address.trim() || address.trim().length < 5) {
      setErrorMessage('Please enter your complete delivery address (House/Shop #, Street, Area).');
      return;
    }

    // 4. Validate City
    if (!city.trim()) {
      setErrorMessage('Please enter your City name (e.g. Lahore, Karachi, Rawalpindi, etc.).');
      return;
    }

    // 5. Validate Shoe Size
    if (!selectedSize) {
      setErrorMessage('Please select your shoe size.');
      return;
    }

    // 6. Validate Quantity
    if (!quantity || quantity < 1) {
      setErrorMessage('Please select at least 1 quantity.');
      return;
    }

    // Advance Payment Screenshot check
    if (isAdvance && !paymentScreenshot) {
      setErrorMessage('Please upload your payment screenshot to verify your Advance Payment and receive your 5% discount.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the real persistent order in StoreContext (saved to state & IndexedDB)
      const order = createOrder({
        customerName: fullName.trim(),
        contactNumber: mobileNumber.trim(),
        whatsappNumber: mobileNumber.trim(),
        address: address.trim(),
        city: city.trim(),
        specialInstructions: specialInstructions.trim() || undefined,
        items: [
          {
            product,
            selectedSize,
            quantity,
          },
        ],
        paymentMethod,
        subtotal,
        discount,
        shippingFee: 0,
        finalAmount,
        paymentScreenshot: isAdvance && paymentScreenshot ? paymentScreenshot : undefined,
      });

      // Construct pre-filled WhatsApp message for immediate confirmation
      const whatsappUrl = getOrderWhatsAppUrl(order);

      // Open WhatsApp chat directly so the customer can confirm with the store
      try {
        window.open(whatsappUrl, '_blank');
      } catch {
        // Pop-up blockers fallback
      }

      setIsSubmitting(false);
      onOrderSuccess(order);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage('Failed to place order. Please try again or contact us directly on WhatsApp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border-2 border-yellow-400/80 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header - Black and Yellow Theme */}
        <div className="bg-black text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-yellow-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-extrabold shadow-md">
              <PackageCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-luxury font-extrabold text-lg sm:text-xl text-yellow-400">
                  Instant Checkout
                </h2>
                <span className="hidden sm:inline-block bg-yellow-400/20 text-yellow-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-yellow-400/40 uppercase">
                  Fast & Secure
                </span>
              </div>
              <p className="text-[11px] text-gray-300">
                Hasnain Zarri Chappal Store • WhatsApp: {STORE_WHATSAPP_NUMBER}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-yellow-400 hover:text-black text-gray-300 transition-colors"
            title="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 24-Hour Special Offer Countdown Timer */}
        <CheckoutCountdownTimer />

        {/* Scrollable Form Content */}
        <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span className="font-semibold">{errorMessage}</span>
            </div>
          )}

          {/* 1. Selected Product Summary Card */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/60 border border-amber-200/90 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center justify-between">
              <span>Selected Product Summary</span>
              <span className="text-emerald-700 font-extrabold">In Stock</span>
            </div>

            <div className="flex gap-3 sm:gap-4 items-center">
              {/* Product Thumbnail with Golden Halo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white shrink-0 border border-amber-300 shadow-sm relative">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover object-center"
                />
                {discountPercent && (
                  <span className="absolute top-1 left-1 bg-red-600 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded shadow">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                  {product.category}
                </span>
                <h3 className="font-serif-luxury font-bold text-sm sm:text-base text-gray-900 leading-snug truncate">
                  {product.title}
                </h3>
                
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-base sm:text-lg font-mono font-extrabold text-gray-900">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through font-mono">
                      Rs. {product.oldPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-500 font-medium">/ pair</span>
                </div>

                {/* Clearly Visible "ALLOWED TO OPEN PARCEL" Badge */}
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black text-yellow-400 border border-yellow-400/90 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-2xs">
                    <PackageCheck className="w-3 h-3 text-yellow-400 shrink-0 stroke-[2.5]" />
                    <span>ALLOWED TO OPEN PARCEL</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Shoe Size Selection & Quantity Row */}
            <div className="mt-3.5 pt-3 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Field 5: Shoe Size Selection */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1.5 flex items-center justify-between">
                  <span>
                    Select Shoe Size <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">Standard Pakistan Fit</span>
                </label>
                
                {product.sizes && product.sizes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                          selectedSize === size
                            ? 'bg-black text-yellow-400 border-black shadow-md scale-105'
                            : 'bg-white hover:bg-yellow-50 text-gray-800 border-gray-300'
                        }`}
                      >
                        Size {size}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Enter Size (e.g. 8, 9, 10)"
                    value={String(selectedSize)}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-900"
                  />
                )}
              </div>

              {/* Field 6: Quantity Selection */}
              <div>
                <label className="text-xs font-bold text-gray-800 block mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center bg-white border border-gray-300 rounded-xl p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-mono font-extrabold text-sm text-gray-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-600">
                    Total: <strong className="font-mono text-gray-900 font-bold">Rs. {(unitPrice * quantity).toLocaleString()}</strong>
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Customer Delivery Information */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-black text-yellow-400 flex items-center justify-center text-[11px] font-extrabold">
                1
              </span>
              <span>Customer & Delivery Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Field 1: Customer Full Name */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Bilal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-2xs"
                />
              </div>

              {/* Field 2: Mobile Number */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Mobile / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03432782295"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-2xs font-mono"
                />
              </div>

              {/* Field 4: City */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lahore, Karachi, Rawalpindi, Peshawar"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-2xs"
                />
              </div>

              {/* Optional Special Instructions */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Delivery Notes / Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near TT Hotel / Call before delivery"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all shadow-2xs"
                />
              </div>

              {/* Field 3: Complete Delivery Address */}
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Complete Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House/Shop #, Street #, Mohallah, Sector / Colony name"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all resize-none shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Method Choice */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-black text-yellow-400 flex items-center justify-center text-[11px] font-extrabold">
                2
              </span>
              <span>Payment Option</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cash on Delivery (COD) */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-yellow-50/60 border-yellow-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-yellow-600 bg-yellow-500' : 'border-gray-400'
                  }`}>
                    {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900">
                      Cash on Delivery (COD)
                    </h5>
                    <span className="text-[10px] text-gray-500 block">
                      Pay cash to rider upon delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Advance Payment (5% OFF) */}
              <div
                onClick={() => setPaymentMethod('advance')}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                  paymentMethod === 'advance'
                    ? 'bg-amber-50/70 border-amber-500 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="absolute top-2 right-2 bg-yellow-400 text-black font-black text-[9px] px-2 py-0.5 rounded-full border border-yellow-500 uppercase">
                  5% OFF
                </span>
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'advance' ? 'border-amber-600 bg-amber-500' : 'border-gray-400'
                  }`}>
                    {paymentMethod === 'advance' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900">
                      Advance Payment
                    </h5>
                    <span className="text-[10px] text-amber-800 font-bold block">
                      JazzCash, Easypaisa or UBL Bank (Save 5%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advance Payment Bank Details if chosen */}
            {paymentMethod === 'advance' && (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 fill-amber-500" />
                  <span>Transfer Discounted Amount: <strong className="font-mono text-sm">Rs. {finalAmount.toLocaleString()}</strong></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* JazzCash */}
                  <div className="p-2.5 rounded-xl bg-white border border-red-300 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="font-bold text-red-700 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-red-600" />
                        <span>JazzCash</span>
                      </div>
                      <div className="font-mono font-black text-gray-900 text-sm">03048539583</div>
                      <span className="text-[10px] text-gray-600 font-medium">Title: Muhammad Hasnain</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('03048539583', 'jazzcash')}
                      className="p-1.5 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-800 text-[11px] font-bold border border-red-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedJazzcash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedJazzcash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Easypaisa */}
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between shadow-2xs">
                    <div>
                      <div className="font-bold text-emerald-700 flex items-center gap-1">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Easypaisa</span>
                      </div>
                      <div className="font-mono font-black text-gray-900 text-sm">03432782295</div>
                      <span className="text-[10px] text-gray-600 font-medium">Title: Muhammad Hasnain</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('03432782295', 'easypaisa')}
                      className="p-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedEasypaisa ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedEasypaisa ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* UBL Bank */}
                  <div className="p-2.5 rounded-xl bg-white border border-blue-300 flex items-center justify-between shadow-2xs sm:col-span-2">
                    <div>
                      <div className="font-bold text-blue-700 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>UBL Bank Account</span>
                      </div>
                      <div className="font-mono font-black text-gray-900 text-sm">0564327905374</div>
                      <span className="text-[10px] text-gray-600 font-medium">Title: Muhammad Hasnain</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('0564327905374', 'ubl')}
                      className="p-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedUBL ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUBL ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="text-xs font-bold text-gray-800 block mb-1">
                    Upload Payment Screenshot <span className="text-red-500">*</span>
                  </label>
                  {paymentScreenshot ? (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-300 flex items-center justify-between shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={paymentScreenshot}
                          alt="Screenshot"
                          className="w-12 h-12 object-cover rounded-lg border"
                        />
                        <span className="text-xs font-bold text-emerald-700">Screenshot Attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentScreenshot(null)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 hover:border-yellow-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-white">
                      <Upload className="w-6 h-6 text-amber-600 mb-1" />
                      <span className="text-xs font-semibold text-gray-800">
                        Click to select payment screenshot
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

          {/* 4. Total Calculation Summary */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <div className="flex justify-between text-xs sm:text-sm text-gray-700">
              <span>Unit Price ({quantity} {quantity > 1 ? 'pairs' : 'pair'} of Size {selectedSize})</span>
              <span className="font-mono font-semibold text-gray-900">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>

            {isAdvance && (
              <div className="flex justify-between text-xs sm:text-sm text-emerald-700 font-semibold bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  5% Advance Payment Discount
                </span>
                <span className="font-mono font-bold">- Rs. {discount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-xs sm:text-sm text-gray-700">
              <span>Doorstep Delivery Across Pakistan</span>
              <span className="text-emerald-700 font-bold uppercase text-xs">FREE</span>
            </div>

            <div className="pt-2 border-t border-gray-300 flex justify-between items-baseline">
              <span className="text-sm sm:text-base font-extrabold text-gray-900 font-serif-luxury">
                Total Amount Payable:
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
                Rs. {finalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 3-Day Express Delivery Schedule */}
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between text-[11px] text-gray-700">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>3-Day Delivery:</strong> Dispatched today, delivered at your doorstep across Pakistan.
              </span>
            </div>
          </div>

          {/* Customer Protection Badges */}
          <CustomerProtectionBadges variant="checkout" />

          {/* Requirement 3: Clear Place Order Button (Matching black & yellow theme) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-2xl bg-yellow-400 hover:bg-yellow-500 active:scale-[0.99] text-black font-black text-base sm:text-lg shadow-xl shadow-yellow-400/25 border-2 border-yellow-500 transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            {isSubmitting ? (
              <span>Saving Order...</span>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Place Order • Rs. {finalAmount.toLocaleString()}</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-gray-500">
            Clicking <strong>Place Order</strong> will safely save your order in our system and open official WhatsApp to confirm your details.
          </p>
        </form>
      </div>
    </div>
  );
};
