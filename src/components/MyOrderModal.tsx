import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  RefreshCw, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle,
  MapPin, 
  Phone, 
  Calendar,
  MessageCircle,
  ShieldCheck
} from 'lucide-react';
import { Order } from '../types';
import { STORE_WHATSAPP_NUMBER, getGeneralWhatsAppUrl } from '../utils/whatsapp';

interface MyOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
  initialPhone?: string;
}

export const MyOrderModal: React.FC<MyOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderId = '',
  initialPhone = '',
}) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (initialOrderId) setOrderIdInput(initialOrderId);
    if (initialPhone) setPhoneInput(initialPhone);
    if (initialOrderId && initialPhone && isOpen) {
      handleLookup(initialOrderId, initialPhone);
    }
  }, [initialOrderId, initialPhone, isOpen]);

  if (!isOpen) return null;

  const handleLookup = async (lookupId?: string, lookupPhone?: string) => {
    const idToQuery = (lookupId || orderIdInput).trim();
    const phoneToQuery = (lookupPhone || phoneInput).trim();

    if (!idToQuery) {
      setError('Please enter your Order ID (e.g. HZC-1234).');
      return;
    }
    if (!phoneToQuery) {
      setError('Please enter the phone number associated with your order.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: idToQuery,
          contactNumber: phoneToQuery,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'No matching order found. Please check your Order ID and phone number.');
        setOrder(null);
      } else {
        setOrder(data.order);
        setLastRefreshed(new Date());
        setError(null);
      }
    } catch {
      setError('Failed to connect to the store database. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const normalized = (status || '').toLowerCase();
    if (normalized.includes('deliver')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    }
    if (normalized.includes('dispatch') || normalized.includes('shipped')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
          <Truck className="w-3.5 h-3.5 text-blue-600" />
          <span>Dispatched / In Transit</span>
        </span>
      );
    }
    if (normalized.includes('cancel')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Cancelled</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
        <span>{status || 'In Processed'}</span>
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg sm:text-xl font-bold">
                My Order & Courier Tracking
              </h3>
              <p className="text-white/80 text-xs">
                Look up order status, items, courier tracking ID & delivery progress
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Lookup Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup();
            }}
            className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Order ID / Consignment #
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HZC-5842"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03432782295"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-gray-500">
                🔒 Private lookup: Phone number & Order ID are securely verified together.
              </span>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching Database...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Lookup My Order</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{error}</p>
                <p className="text-xs text-red-500 mt-1">
                  If you need immediate assistance with your order, message us on WhatsApp: <strong>{STORE_WHATSAPP_NUMBER}</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Order Found Details */}
          {order && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Order Status & Refresh Bar */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">
                      Current Order Status
                    </span>
                    <div className="mt-1">
                      {getStatusBadge(order.status)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  {lastRefreshed && (
                    <span className="text-[10px] text-gray-400 hidden sm:inline">
                      Refreshed: {lastRefreshed.toLocaleTimeString()}
                    </span>
                  )}
                  <button
                    onClick={() => handleLookup()}
                    disabled={isLoading}
                    title="Refresh latest status from store database"
                    className="p-2 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="text-xs">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Courier Tracking Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-700" />
                    <h4 className="font-bold text-sm text-gray-900">
                      Courier Shipping & Tracking Details
                    </h4>
                  </div>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    {order.courierName || 'M&P Express Logistics'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-amber-200">
                  <div>
                    <span className="text-gray-500 block">Courier Tracking ID / Consignment:</span>
                    <strong className="font-mono text-sm text-gray-900 block mt-0.5">
                      {order.trackingNumber || 'Pending Courier Dispatch Assignment'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Dispatch Date:</span>
                    <strong className="text-gray-900 block mt-0.5">
                      {order.dispatchDate ? new Date(order.dispatchDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Processing in Craft Workshop'}
                    </strong>
                  </div>
                </div>

                {order.trackingUrl ? (
                  <a
                    href={order.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-xs"
                  >
                    <span>Track Live on {order.courierName || 'Courier'} Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : order.trackingNumber ? (
                  <p className="text-[11px] text-gray-600 italic">
                    💡 Tracking ID #{order.trackingNumber} assigned. Live courier tracking updates appear as soon as the package reaches the distribution hub.
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-900">
                    Your order is currently being handcrafted with traditional zarri embroidery. Tracking number will be automatically updated here upon dispatch.
                  </p>
                )}
              </div>

              {/* Order Info & Items */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-200 text-xs gap-2">
                  <div>
                    <span className="text-gray-500 block">Order ID:</span>
                    <strong className="font-mono text-amber-800 text-sm">#{order.id}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Order Date:</span>
                    <strong className="text-gray-800">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Payment Method:</span>
                    <strong className="text-gray-800">
                      {order.paymentMethod === 'advance' ? 'Advance Payment (5% Discount)' : 'Cash on Delivery'}
                    </strong>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
                    Ordered Footwear
                  </span>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">{item.product.title}</div>
                          <div className="text-[11px] text-gray-500">
                            Size: <strong className="text-amber-800">{item.selectedSize}</strong> • Qty: <strong>{item.quantity}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-gray-900">
                        Rs. {(item.product.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial Summary */}
                <div className="pt-3 border-t border-gray-200 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-mono text-gray-900">Rs. {order.subtotal?.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>5% Advance Payment Discount</span>
                      <span className="font-mono">- Rs. {order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Charges</span>
                    <span className="text-emerald-700 font-bold">FREE Across Pakistan</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-amber-800 pt-2 border-t border-gray-300">
                    <span>Total Amount Payable</span>
                    <span className="font-mono text-base">Rs. {order.finalAmount?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Shipping Destination */}
                <div className="pt-3 border-t border-gray-200 text-xs text-gray-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Delivery Address: {order.address}, {order.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Customer Contact: {order.contactNumber}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={`https://wa.me/92${STORE_WHATSAPP_NUMBER.replace(/^0/, '')}?text=${encodeURIComponent(
                    `Salam Hasnain Zarri Chappal! I am inquiring about my Order ID #${order.id} for ${order.customerName}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp Inquiry for #{order.id}</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Protection Note */}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Hasnain Zarri Chappal Store Verified Customer Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
