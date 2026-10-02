import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Plus, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Printer,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, Product } from '../../types';

interface ManualWhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order, openLabelImmediately?: boolean) => void;
}

export const ManualWhatsAppOrderModal: React.FC<ManualWhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const { products, getAuthHeaders } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Peshawar');
  const [postalCode, setPostalCode] = useState('');

  // Selected product from catalog or custom
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [customProductTitle, setCustomProductTitle] = useState('Premium Red Kolapuri Chappal');
  const [size, setSize] = useState('8');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(1999);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance'>('cod');
  const [courierName, setCourierName] = useState('M&P Express Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [adminNotes, setAdminNotes] = useState('Order received via WhatsApp chat');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handler to load the exact Test Sample Order from Requirement 8
  const handleLoadTestSampleOrder = () => {
    setCustomerName('Muhammad Hasnain');
    setContactNumber('03432782295');
    setWhatsappNumber('03432782295');
    setAddress('House #12, Street 4, Sector G-9/1, Near Zarri Market');
    setCity('Peshawar');
    setPostalCode('25000');
    setCustomProductTitle('Premium Red Kolapuri Chappal');
    setSize('8');
    setQuantity(1);
    setPrice(1999);
    setPaymentMethod('cod');
    setCourierName('M&P Express Logistics');
    setTrackingNumber('');
    setSpecialInstructions('Handle with Care - Open & Inspect allowed before payment');
    setAdminNotes('Test sample order for Courier Airway Bill verification');
    setError(null);
  };

  const handleProductSelect = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      setCustomProductTitle(prod.title);
      setPrice(prod.price);
      if (prod.sizes && prod.sizes.length > 0) {
        setSize(String(prod.sizes[0]));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, openLabel: boolean = true) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || customerName.trim().length < 2) {
      setError('Please enter a valid customer name.');
      return;
    }
    if (!contactNumber.trim() || contactNumber.trim().length < 7) {
      setError('Please enter a valid customer contact number.');
      return;
    }
    if (!address.trim() || address.trim().length < 3) {
      setError('Please enter the delivery address.');
      return;
    }
    if (!city.trim()) {
      setError('Please enter the delivery city.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Find matching product or construct custom product representation
      const matchedProduct: Product = products.find((p) => p.id === selectedProductId) || {
        id: `hzc-custom-${Date.now()}`,
        title: customProductTitle.trim() || 'Handcrafted Zarri Footwear',
        price: Number(price) || 1999,
        category: "Men's Chappal",
        sizes: [size],
        stockQuantity: 10,
        stockStatus: 'in_stock',
        description: 'Handcrafted Zarri Footwear with Pure Leather Sole',
        images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80'],
        isFeatured: false,
        isNewArrival: false,
        inRunningBanner: false,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      const orderPayload = {
        customerName: customerName.trim(),
        contactNumber: contactNumber.trim(),
        whatsappNumber: (whatsappNumber || contactNumber).trim(),
        address: address.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        items: [
          {
            product: matchedProduct,
            quantity: Number(quantity) || 1,
            selectedSize: size,
          },
        ],
        subtotal: (Number(price) || 1999) * (Number(quantity) || 1),
        discount: 0,
        shippingFee: 0,
        finalAmount: (Number(price) || 1999) * (Number(quantity) || 1),
        paymentMethod: paymentMethod,
        courierName: courierName.trim() || 'M&P Express Logistics',
        trackingNumber: trackingNumber.trim() || null,
        courierBookingStatus: trackingNumber.trim() ? 'Booked' : 'Not Booked',
        specialInstructions: specialInstructions.trim(),
        adminNotes: adminNotes.trim(),
        status: 'In Processed',
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(orderPayload),
      });

      const savedOrder = await res.json();

      if (!res.ok) {
        throw new Error(savedOrder.error || 'Failed to save order to persistent database');
      }

      onOrderCreated(savedOrder, openLabel);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating order in backend database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-base sm:text-lg font-bold">
                Manual Order Entry (WhatsApp Orders)
              </h3>
              <p className="text-white/80 text-xs">
                Save orders received via phone/chat & instantly generate courier shipping labels
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={(e) => handleSubmit(e, true)} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Quick Pre-fill Banner for Requirement 8 Test */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-amber-950 font-medium">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Want to test the shipping label with the required sample order?
              </span>
            </div>
            <button
              type="button"
              onClick={handleLoadTestSampleOrder}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold whitespace-nowrap shadow-xs cursor-pointer transition-all"
            >
              Load Test: Muhammad Hasnain (Rs. 1,999)
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              1. Customer Information
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Hasnain"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03432782295"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">WhatsApp Number (if different)</label>
                <input
                  type="tel"
                  placeholder="Optional, defaults to contact phone"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Destination City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Peshawar, Lahore, Karachi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm uppercase font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Complete Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="House/Shop #, Street, Area, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Product & COD Details */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              2. Ordered Footwear & Payment Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Select Catalog Product or Type Custom</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 mb-1.5"
                >
                  <option value="">-- Custom Handcrafted Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} (Rs. {p.price})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  placeholder="Product Title"
                  value={customProductTitle}
                  onChange={(e) => setCustomProductTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Size *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 8"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">C.O.D. Total Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-base font-mono font-black text-amber-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="advance">Advance Payment (Paid Online)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Courier Details */}
          <div className="space-y-3 pt-3 border-t border-gray-200">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
              3. Courier Logistics & Airway Bill Details
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. M&P Express Logistics"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Courier Tracking / AWB (Leave blank if pending)</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Optional (assigned upon booking)"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-gray-700 font-semibold mb-1">Internal Notes</label>
                <input
                  type="text"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Private store notes (hidden from customer)"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              Saves order to persistent database and prepares shipping label.
            </span>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:scale-[1.02] active:scale-[0.98] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-70"
              >
                <Printer className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Save & Generate Courier Label'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
