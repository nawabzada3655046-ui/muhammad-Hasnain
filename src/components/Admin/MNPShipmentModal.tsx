import React, { useState } from 'react';
import { 
  X, 
  Truck, 
  Package, 
  Check, 
  ShieldCheck, 
  Copy, 
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Order, MNPShipmentBooking, MNPConfig } from '../../types';
import { getCustomerStatusWhatsAppUrl } from '../../utils/whatsapp';

interface MNPShipmentModalProps {
  order: Order | null;
  mnpConfig: MNPConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (orderId: string, booking: MNPShipmentBooking) => void;
}

export const MNPShipmentModal: React.FC<MNPShipmentModalProps> = ({
  order,
  mnpConfig,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  if (!isOpen || !order) return null;

  // Generate suggested MNP Consignment Number if order doesn't have one
  const defaultConsignment = order.trackingNumber || `MNP-${order.id.replace('HZC-', '')}${Math.floor(1000 + Math.random() * 9000)}`;
  
  const [consignmentNumber, setConsignmentNumber] = useState(defaultConsignment);
  const [weightKg, setWeightKg] = useState<number>(1.0);
  const [pieces, setPieces] = useState<number>(order.items.reduce((s, i) => s + i.quantity, 0));
  const [serviceType, setServiceType] = useState<string>(mnpConfig.defaultServiceType || 'Overnight');
  const [originCity, setOriginCity] = useState<string>(mnpConfig.originCity || 'Liaqatpur');
  const [destinationCity, setDestinationCity] = useState<string>(order.city);
  const [codAmount, setCodAmount] = useState<number>(order.paymentMethod === 'advance' ? 0 : order.finalAmount);
  const [remarks, setRemarks] = useState<string>(
    order.specialInstructions ? `Special: ${order.specialInstructions}` : `Order #${order.id} - Handcrafted Traditional Footwear`
  );
  const [copied, setCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCopyConsignment = () => {
    navigator.clipboard.writeText(consignmentNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consignmentNumber.trim()) return;

    const booking: MNPShipmentBooking = {
      consignmentNumber: consignmentNumber.trim().toUpperCase(),
      bookedAt: new Date().toISOString(),
      weightKg: Number(weightKg) || 1,
      pieces: Number(pieces) || 1,
      serviceType,
      originCity: originCity.trim(),
      destinationCity: destinationCity.trim(),
      codAmount: Number(codAmount),
      remarks: remarks.trim(),
    };

    onConfirmBooking(order.id, booking);
    setIsSuccess(true);
  };

  const whatsappMessage = `Salam ${order.customerName}! Your order *#${order.id}* from Hasnain Zarri Chappal Store has been booked for courier dispatch via *MNP Courier*.\n\n📦 *MNP Consignment / Tracking Number:* ${consignmentNumber}\n🚚 *Courier:* MNP Courier (M&P Express Logistics)\n📍 *Destination:* ${destinationCity}\n💰 *Payable Amount:* ${codAmount > 0 ? `Rs. ${codAmount.toLocaleString()} (COD)` : 'Rs. 0 (Paid in Advance)'}\n\nTrack your shipment live at: https://track.mulphilog.com`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 font-bold">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury font-bold text-lg text-gray-900">
                  Prepare MNP Shipment Booking
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300">
                  MNP Courier
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Order <strong className="font-mono text-amber-700">#{order.id}</strong> • Customer: <strong>{order.customerName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-6 sm:p-8 space-y-5 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-xl font-bold font-serif-luxury text-gray-900">
                Shipment Successfully Booked with MNP Courier!
              </h4>
              <p className="text-xs text-gray-600 max-w-md mx-auto">
                Order status has been updated to <strong>Shipped</strong>. Consignment number has been recorded on the order.
              </p>
            </div>

            {/* Consignment card */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 max-w-sm mx-auto space-y-2">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                MNP Consignment / Tracking Number
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl font-extrabold text-gray-900 tracking-wider">
                  {consignmentNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyConsignment}
                  className="p-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-800 transition-colors"
                  title="Copy Tracking Number"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={getCustomerStatusWhatsAppUrl(order, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Send MNP Tracking to Customer on WhatsApp</span>
              </a>

              <a
                href={`https://track.mulphilog.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs flex items-center justify-center gap-2 border border-gray-300 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open MNP Courier Portal</span>
              </a>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              Done & Return to Orders
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Courier info pill */}
            <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span className="font-semibold text-gray-800">
                  MNP Courier Integration Status:
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  mnpConfig.isConnected 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {mnpConfig.isConnected ? `Connected (Acc: ${mnpConfig.accountNumber || 'Configured'})` : 'Local Ready Mode'}
                </span>
              </div>
              <span className="text-[11px] text-gray-500 hidden sm:inline">
                Origin: <strong>{originCity}</strong>
              </span>
            </div>

            {/* Consignment Number Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-amber-700" />
                  <span>Tracking Number / Consignment Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setConsignmentNumber(`MNP-${order.id.replace('HZC-', '')}${Math.floor(1000 + Math.random() * 9000)}`)}
                  className="text-[10px] text-amber-700 hover:underline font-semibold"
                >
                  Generate New Number
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={consignmentNumber}
                  onChange={(e) => setConsignmentNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MNP-1082749 or 982148201"
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm font-mono font-extrabold text-gray-900 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-gray-500 block">
                Official MNP Consignment / Airway Bill (AWB) number generated from portal or tracking label.
              </span>
            </div>

            {/* Grid: Service Type & Destination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  MNP Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-3 py-2 text-xs font-medium text-gray-900 focus:outline-none"
                >
                  <option value="Overnight">Overnight Express</option>
                  <option value="Second Day">Second Day Service</option>
                  <option value="Standard COD">Standard COD Parcel</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Destination City
                </label>
                <input
                  type="text"
                  required
                  value={destinationCity}
                  onChange={(e) => setDestinationCity(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-gray-900 focus:outline-none"
                />
              </div>
            </div>

            {/* Grid: Weight, Pieces & COD Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Weight (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Number of Pieces
                </label>
                <input
                  type="number"
                  min="1"
                  value={pieces}
                  onChange={(e) => setPieces(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  COD Collect Amount (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={codAmount}
                  onChange={(e) => setCodAmount(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-gray-900 font-mono font-bold focus:outline-none"
                />
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  {order.paymentMethod === 'advance' ? 'Rs. 0 (Advance Paid)' : 'Cash on Delivery collect'}
                </span>
              </div>
            </div>

            {/* Origin & Delivery Address */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Shipper / Origin Location:</span>
                <span className="font-semibold text-gray-900">{originCity}, Pakistan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Consignee Address:</span>
                <span className="font-semibold text-gray-900 text-right">{order.address}, {order.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Consignee Contact:</span>
                <span className="font-mono font-bold text-amber-700">{order.contactNumber || order.whatsappNumber}</span>
              </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Booking Remarks / Courier Instructions
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Product description or delivery instructions..."
                className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Confirm MNP Booking & Save Tracking</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
