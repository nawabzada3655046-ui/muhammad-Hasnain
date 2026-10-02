import React from 'react';
import { 
  CheckCircle2, 
  MessageCircle, 
  Printer, 
  MapPin, 
  Sparkles,
  Phone,
  X,
  Truck,
  PackageCheck
} from 'lucide-react';
import { Order } from '../types';
import { STORE_WHATSAPP_NUMBER, STORE_ADDRESS, getOrderWhatsAppUrl } from '../utils/whatsapp';
import { CustomerProtectionBadges } from './CustomerProtectionBadges';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onOpenMyOrder?: (orderId: string, phone: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onOpenMyOrder,
}) => {
  // Dynamic 3-Day Delivery Timeline based on the confirmed order date
  const deliveryTimeline = React.useMemo(() => {
    const baseDate = order?.createdAt ? new Date(order.createdAt) : new Date();
    
    const day0 = new Date(baseDate);
    const day1 = new Date(baseDate);
    day1.setDate(baseDate.getDate() + 1);
    const day2 = new Date(baseDate);
    day2.setDate(baseDate.getDate() + 2);

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
        description: 'Prepared & handed to express courier',
      },
      {
        step: 2,
        dayLabel: 'Tomorrow',
        formattedDate: formatFullDate(day1),
        statusTitle: 'In Transit / Destination',
        description: 'Transit to local city distribution hub',
      },
      {
        step: 3,
        dayLabel: 'Day After Tomorrow',
        formattedDate: formatFullDate(day2),
        statusTitle: 'Expected Delivery',
        description: 'Doorstep delivery across Pakistan',
      },
    ];
  }, [order?.createdAt]);

  if (!order) return null;

  const handleWhatsAppNotify = () => {
    const url = getOrderWhatsAppUrl(order);
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto print:bg-white print:text-black print:border-black"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
          
          {/* Success Banner */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-100 p-1 mx-auto shadow-md shadow-amber-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            
            <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block pt-1">
              Hasnain Zarri Chappal Store
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif-luxury text-gray-900 leading-tight">
              Congratulations! Your Order Has Been Placed Successfully!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
              Shukriya! Your order <strong className="font-mono text-amber-800">#{order.id}</strong> has been saved successfully in our persistent database. You can track its live status at any time.
            </p>
          </div>

          {/* 3-Day Delivery Timeline */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
                  3-Day Express Delivery Timeline
                </h4>
                <p className="text-[11px] text-gray-500">
                  Calculated from your confirmed order date
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="relative">
              <div className="hidden sm:block absolute top-5 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 z-0" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 relative z-10">
                {deliveryTimeline.map((item, idx) => (
                  <div
                    key={item.step}
                    className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2.5 sm:p-3 rounded-xl border bg-white ${
                      idx === 0
                        ? 'border-amber-400 shadow-2xs'
                        : idx === 2
                        ? 'border-emerald-300 bg-emerald-50/30'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      idx === 0
                        ? 'bg-amber-500 border-amber-600 text-white'
                        : idx === 1
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    }`}>
                      {idx === 0 && <PackageCheck className="w-4 h-4" />}
                      {idx === 1 && <Truck className="w-4 h-4" />}
                      {idx === 2 && <CheckCircle2 className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 sm:w-full min-w-0">
                      <div className="flex sm:flex-col items-baseline sm:items-center justify-between sm:justify-center gap-0.5">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                          {item.dayLabel}
                        </span>
                        <span className="text-xs font-extrabold text-gray-900 font-mono">
                          {item.formattedDate}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-800 mt-0.5">
                        {item.statusTitle}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Details Receipt Box */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
            
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-gray-200 text-xs sm:text-sm gap-2">
              <div>
                <span className="text-gray-500 block text-xs">Order Number:</span>
                <span className="font-mono font-extrabold text-amber-800 text-base">
                  #{order.id}
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Customer Name:</span>
                <span className="font-bold text-gray-900">{order.customerName}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Payment Method:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                  order.paymentMethod === 'advance'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {order.paymentMethod === 'advance' ? 'Advance Payment (5% OFF)' : 'Cash on Delivery'}
                </span>
              </div>
            </div>

            {/* Customer Contact & Address */}
            <div className="text-xs text-gray-700 space-y-1">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Contact / WhatsApp: <strong className="text-gray-900">{order.whatsappNumber}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Delivery Address: {order.address}, {order.city} {order.postalCode ? `(${order.postalCode})` : ''}</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-gray-200/80 text-[11px] text-gray-600">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Store Address: <strong className="text-gray-900">{STORE_ADDRESS}</strong></span>
              </div>
            </div>

            {/* Items Table */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                Ordered Products
              </h4>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white border border-gray-200 flex items-center justify-between text-xs sm:text-sm shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      />
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
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-gray-200 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-mono text-gray-900 font-semibold">Rs. {order.subtotal.toLocaleString()}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    5% Advance Payment Discount
                  </span>
                  <span className="font-mono font-bold">- Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping Charges</span>
                <span className="text-emerald-700 font-bold uppercase text-xs">FREE Across Pakistan</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-amber-800 pt-2 border-t border-gray-300">
                <span>Final Amount Payable</span>
                <span className="font-mono text-xl">Rs. {order.finalAmount.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Customer Protection Badges */}
          <CustomerProtectionBadges variant="confirmation" />

          {/* Action Buttons (Requirement 4) */}
          <div className="space-y-3 print:hidden">
            {/* WhatsApp Contact Button */}
            <button
              onClick={handleWhatsAppNotify}
              className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-base flex items-center justify-center gap-3 shadow-lg shadow-green-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              <span>Contact Us on WhatsApp ({STORE_WHATSAPP_NUMBER})</span>
            </button>

            {/* My Order & Track My Order Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (onOpenMyOrder) {
                    onOpenMyOrder(order.id, order.contactNumber || order.whatsappNumber);
                  }
                }}
                className="py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <PackageCheck className="w-4 h-4 text-amber-700" />
                <span>My Order Details</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onOpenMyOrder) {
                    onOpenMyOrder(order.id, order.contactNumber || order.whatsappNumber);
                  }
                }}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track My Order Live</span>
              </button>
            </div>

            {/* Print & Continue Shopping */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={handlePrint}
                className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-6 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
