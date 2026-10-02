import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { 
  Printer, 
  X, 
  Check, 
  Edit3, 
  Eye, 
  Download, 
  SlidersHorizontal, 
  AlertCircle,
  PackageCheck,
  RefreshCw,
  Copy
} from 'lucide-react';
import { Order } from '../../types';
import { STORE_ADDRESS, STORE_WHATSAPP_NUMBER } from '../../utils/whatsapp';
import { encodeCode128 } from '../../utils/code128';

interface ShippingLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPrinted?: (orderId: string) => void;
  initialMode?: 'preview' | 'edit';
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  isOpen,
  onClose,
  onMarkAsPrinted,
  initialMode = 'preview',
}) => {
  // Mode: 'preview' (WYSIWYG thermal label) or 'edit' (field customizer)
  const [mode, setMode] = useState<'preview' | 'edit'>(initialMode);
  // Paper Size: '100x150' (4x6 thermal) or 'A6'
  const [labelSize, setLabelSize] = useState<'100x150' | 'A6'>('100x150');
  const [marked, setMarked] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Editable Label Form State initialized from order
  const [destinationCity, setDestinationCity] = useState('');
  const [consigneeName, setConsigneeName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [serviceType, setServiceType] = useState('COD / STANDARD');
  
  const [originCity, setOriginCity] = useState('LIAQATPUR');
  const [shipperName, setShipperName] = useState('HASNAIN ZARRI CHAPPAL STORE');
  const [sellerPhone, setSellerPhone] = useState(STORE_WHATSAPP_NUMBER);
  const [returnAddress, setReturnAddress] = useState(STORE_ADDRESS);
  const [returnBranch, setReturnBranch] = useState('Liaqatpur Main Hub (Peshawar Division)');

  const [codAmount, setCodAmount] = useState<number>(0);
  const [weightKg, setWeightKg] = useState('0.5');
  const [pieces, setPieces] = useState<number>(1);
  const [productTitle, setProductTitle] = useState('');
  const [productSize, setProductSize] = useState('8');
  const [productDescription, setProductDescription] = useState('Handcrafted Zarri Footwear with Premium Leather Double Sole');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance'>('cod');
  
  const [courierName, setCourierName] = useState('M&P Express Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [bookingStatus, setBookingStatus] = useState('Store Generated Airway Bill');
  const [remarks, setRemarks] = useState('Handle with Care - Open & Inspect Allowed Before Payment');
  const [printDate, setPrintDate] = useState('');

  // Populate state whenever order changes or modal opens
  useEffect(() => {
    if (!order) return;

    setOriginCity('LIAQATPUR');
    setShipperName('HASNAIN ZARRI CHAPPAL STORE');
    setReturnBranch('Liaqatpur Main Hub (Peshawar Division)');

    setDestinationCity(order.city || 'Kohat');
    setConsigneeName(order.customerName || '');
    setContactNumber(order.contactNumber || '');
    setWhatsappNumber(order.whatsappNumber || order.contactNumber || '');
    setDeliveryAddress(order.address || '');
    setPostalCode(order.postalCode || '');
    setServiceType(order.paymentMethod === 'advance' ? 'STANDARD / PAID' : 'COD / STANDARD');

    setCodAmount(order.paymentMethod === 'advance' ? 0 : order.finalAmount || 0);
    setPaymentMethod(order.paymentMethod === 'advance' ? 'advance' : 'cod');

    const totalQty = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 1;
    setPieces(totalQty);

    const firstItem = order.items?.[0];
    if (firstItem) {
      setProductTitle(firstItem.product.title);
      setProductSize(String(firstItem.selectedSize || '8'));
      setProductDescription(
        firstItem.product.description
          ? firstItem.product.description.substring(0, 90)
          : 'Handcrafted Zarri Footwear with Pure Leather Sole'
      );
    } else {
      setProductTitle('Premium Handcrafted Zarri Chappal');
      setProductSize('8');
      setProductDescription('Traditional Handcrafted Zarri Footwear');
    }

    setCourierName(order.courierName || 'M&P Express Logistics');
    setTrackingNumber(order.trackingNumber || '');
    setBookingStatus(order.courierBookingStatus || (order.trackingNumber ? 'Booked' : 'Store Airway Bill Generated'));
    setPrintDate(new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }));
    setMode(initialMode);
    setMarked(order.status === 'Printed');
  }, [order, initialMode, isOpen]);

  // Generate ISO-compliant Vector QR Code
  useEffect(() => {
    if (!order) return;

    // Secure payload: Encodes Order ID, COD, destination, and reference without exposing sensitive internal keys
    const qrPayload = `HZC:ORDER:${order.id}|COD:${codAmount}|DEST:${destinationCity}|NAME:${consigneeName}|TEL:${contactNumber}|DATE:${order.createdAt?.split('T')[0] || ''}`;

    QRCode.toString(
      qrPayload,
      {
        type: 'svg',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err, svgString) => {
        if (!err && svgString) {
          setQrSvg(svgString);
        }
      }
    );
  }, [order, codAmount, destinationCity, consigneeName, contactNumber]);

  // Code 128 Barcodes
  const mainBarcode = useMemo(() => {
    return encodeCode128(trackingNumber.trim() ? trackingNumber.trim() : (order?.id || 'HZC-0000'));
  }, [trackingNumber, order?.id]);

  const secondaryBarcode = useMemo(() => {
    return encodeCode128(order?.id || 'HZC-0000');
  }, [order?.id]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
    if (onMarkAsPrinted && !marked) {
      onMarkAsPrinted(order.id);
      setMarked(true);
    }
  };

  const handleDownloadPdf = () => {
    // Chrome Print Dialog allows direct "Save as PDF" with exact 100x150mm margin
    window.print();
  };

  const formattedOrderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white animate-in fade-in duration-150">
      
      {/* Print-specific style rules ensuring ONLY the shipping label prints with exact airway-bill dimensions */}
      <style>{`
        @media print {
          @page {
            size: ${labelSize === '100x150' ? '100mm 150mm' : 'A6 portrait'};
            margin: 0 !important;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            width: ${labelSize === '100x150' ? '100mm' : '105mm'} !important;
            height: ${labelSize === '100x150' ? '150mm' : '148mm'} !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-shipping-label,
          #printable-shipping-label * {
            visibility: visible !important;
          }
          #printable-shipping-label {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${labelSize === '100x150' ? '100mm' : '105mm'} !important;
            height: ${labelSize === '100x150' ? '150mm' : '148mm'} !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            box-shadow: none !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-700 rounded-3xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls Toolbar (Hidden in Print) */}
        <div className="no-print bg-neutral-950 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-extrabold flex items-center justify-center font-serif-luxury text-sm shadow-md">
              HZ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white font-serif-luxury">
                  Courier Shipping Label Generator
                </h3>
                <span className="font-mono text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  #{order.id}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Official store-branded Airway Bill • Thermal 100×150mm & A6 compatible
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-neutral-800 p-1 rounded-xl flex items-center gap-1 border border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'preview'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Label</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  mode === 'edit'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Fields</span>
              </button>
            </div>

            {/* Paper Dimension Toggle */}
            <select
              value={labelSize}
              onChange={(e) => setLabelSize(e.target.value as any)}
              className="bg-neutral-800 border border-neutral-700 text-gray-200 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
            >
              <option value="100x150">100mm × 150mm (4×6" Thermal)</option>
              <option value="A6">A6 (105mm × 148mm)</option>
            </select>

            {/* Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 border border-neutral-600 transition-all cursor-pointer"
              title="Save as PDF using Chrome print dialog"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            {/* Print Label Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:scale-[1.02] active:scale-[0.98] text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="max-h-[82vh] overflow-y-auto bg-neutral-900 p-4 sm:p-6 print:p-0 print:bg-white print:max-h-none print:overflow-visible">
          {mode === 'edit' ? (
            /* ================= EDIT MODE: CUSTOMIZE SHIPPING LABEL FIELDS ================= */
            <div className="bg-white rounded-2xl p-6 text-gray-900 space-y-6 max-w-3xl mx-auto shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-base font-serif-luxury text-gray-900">
                    Customize Courier Label Fields before Printing
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  View Preview →
                </button>
              </div>

              {/* Consignee Section */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  1. Consignee / Delivery Destination
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Destination City *</label>
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => setDestinationCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Postal Code / Zip</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 25000"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Consignee Full Name *</label>
                    <input
                      type="text"
                      value={consigneeName}
                      onChange={(e) => setConsigneeName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Customer Contact Number *</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 font-semibold mb-1">Complete Delivery Address *</label>
                    <textarea
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* COD & Package Details */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  2. C.O.D. Amount & Parcel Specifications
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">COD Cash to Collect (PKR) *</label>
                    <input
                      type="number"
                      value={codAmount}
                      onChange={(e) => setCodAmount(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-base font-mono font-black text-amber-900 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {paymentMethod === 'advance' ? 'Advance Paid order (Rs. 0)' : 'Actual order total from checkout'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Weight (KG)</label>
                    <input
                      type="text"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Pieces / Quantity</label>
                    <input
                      type="number"
                      value={pieces}
                      onChange={(e) => setPieces(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Product Title</label>
                    <input
                      type="text"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Footwear Size</label>
                    <input
                      type="text"
                      value={productSize}
                      onChange={(e) => setProductSize(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Service Type</label>
                    <input
                      type="text"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Courier & Tracking Details */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  3. Courier Integration & Consignment Tracking (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Courier Partner Name</label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. M&P, TCS, Leopards, Trax"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">AWB / Courier Consignment #</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Leave blank until courier booked"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Booking Status</label>
                    <input
                      type="text"
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-gray-600 font-semibold mb-1">Special Handling Remarks</label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipper & Return Details */}
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  4. Shipper & Store Return Settings
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Shipper Brand Name</label>
                    <input
                      type="text"
                      value={shipperName}
                      onChange={(e) => setShipperName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Origin City</label>
                    <input
                      type="text"
                      value={originCity}
                      onChange={(e) => setOriginCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-bold uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Return Branch Hub</label>
                    <input
                      type="text"
                      value={returnBranch}
                      onChange={(e) => setReturnBranch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 font-semibold mb-1">Seller Helpline Phone</label>
                    <input
                      type="text"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-gray-600 font-semibold mb-1">Seller Return Address</label>
                    <input
                      type="text"
                      value={returnAddress}
                      onChange={(e) => setReturnAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Changes apply immediately to this printable label.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('preview')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    View & Print Label →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ================= PREVIEW MODE: COURIER AIRWAY BILL (100x150mm / A6) ================= */
            <div className="flex flex-col items-center">
              
              {/* THE EXACT AIRWAY BILL PRINTABLE COMPONENT */}
              <div
                id="printable-shipping-label"
                style={{
                  width: labelSize === '100x150' ? '100mm' : '105mm',
                  minHeight: labelSize === '100x150' ? '148mm' : '148mm',
                }}
                className="bg-white text-black border-2 border-black p-2 font-sans select-text shadow-2xl print:shadow-none print:border-2 print:border-black box-border flex flex-col justify-between text-[8.5px] leading-tight"
              >
                <div>
                  {/* 1. TOP HEADER: STORE BRANDING + CODE 128 BARCODE */}
                  <div className="border-b-2 border-black pb-1 mb-1 flex items-center justify-between gap-2">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <div className="w-5 h-5 bg-black text-white font-extrabold flex items-center justify-center font-serif-luxury text-[9px] rounded-xs">
                          HZ
                        </div>
                        <span className="text-[7.5px] font-black tracking-widest uppercase text-gray-800">
                          COURIER AIRWAY BILL
                        </span>
                      </div>
                      <h1 className="text-[12.5px] font-black tracking-tight uppercase leading-none text-black font-serif-luxury">
                        HASNAIN ZARRI CHAPPAL STORE
                      </h1>
                      <div className="text-[7px] font-bold text-gray-700 tracking-wide mt-0.5">
                        Handcrafted Heritage Footwear • Liaqatpur
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {/* Top Barcode */}
                      <div className="flex flex-col items-end">
                        <svg
                          height="26"
                          width="135"
                          viewBox={`0 0 ${mainBarcode.totalWidth} 26`}
                          preserveAspectRatio="none"
                          className="h-[24px] max-w-[140px]"
                        >
                          {mainBarcode.bars.map((bar, idx) => {
                            if (!bar.isBlack) return null;
                            return (
                              <rect
                                key={idx}
                                x={bar.x}
                                y="0"
                                width={bar.width}
                                height="26"
                                fill="#000000"
                              />
                            );
                          })}
                        </svg>
                        <div className="font-mono text-[8px] font-black tracking-widest uppercase text-black text-center w-full">
                          * {trackingNumber.trim() ? trackingNumber : order.id} *
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. ROUTING & QR CODE SECTION (3 ALIGNED COLUMNS AS IN REFERENCE IMAGE) */}
                  <div className="border-b-2 border-black grid grid-cols-12 items-stretch">
                    
                    {/* LEFT COLUMN: DESTINATION / CONSIGNEE */}
                    <div className="col-span-5 border-r-2 border-black p-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-black pb-0.5 mb-1">
                          <span className="text-[8px] font-bold uppercase text-black">To:</span>
                          <span className="text-[11px] font-black uppercase text-black tracking-wide">
                            {destinationCity || 'KOHAT'}
                          </span>
                        </div>
                        <div className="text-[7.5px] leading-snug space-y-0.5">
                          <div>
                            <span className="font-bold">Consignee:</span>{' '}
                            <span className="font-black uppercase">{consigneeName}</span>
                          </div>
                          <div>
                            <span className="font-bold">Contact:</span>{' '}
                            <span className="font-mono font-bold">{contactNumber}</span>
                          </div>
                          <div className="break-words">
                            <span className="font-bold">Address:</span>{' '}
                            <span className="font-normal">{deliveryAddress} {postalCode ? `(${postalCode})` : ''}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CENTER COLUMN: OVERNIGHT + QR CODE + PIECES/WEIGHT */}
                    <div className="col-span-3 border-r-2 border-black flex flex-col justify-between text-center">
                      <div className="border-b border-black py-0.5 font-black text-[9px] uppercase tracking-wider text-black">
                        {serviceType}
                      </div>
                      <div className="p-1 flex items-center justify-center">
                        <div className="w-[66px] h-[66px] bg-white flex items-center justify-center">
                          {qrSvg ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: qrSvg }}
                              className="w-full h-full [&>svg]:w-full [&>svg]:h-full"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 animate-pulse" />
                          )}
                        </div>
                      </div>
                      <div className="border-t border-black py-0.5 px-1 font-bold text-[7px] text-black flex items-center justify-between font-mono">
                        <span>Pieces: {pieces}</span>
                        <span>Weight: {weightKg} KG</span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: ORIGIN / SHIPPER */}
                    <div className="col-span-4 p-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-black pb-0.5 mb-1">
                          <span className="text-[8px] font-bold uppercase text-black">From:</span>
                          <span className="text-[11px] font-black uppercase text-black tracking-wide">
                            {originCity || 'LIAQATPUR'}
                          </span>
                        </div>
                        <div className="text-[7.5px] leading-snug space-y-0.5">
                          <div>
                            <span className="font-bold">Shipper:</span>{' '}
                            <span className="font-black uppercase">{shipperName}</span>
                          </div>
                          <div>
                            <span className="font-bold">Contact:</span>{' '}
                            <span className="font-mono font-bold">{sellerPhone}</span>
                          </div>
                          <div className="break-words">
                            <span className="font-bold">Address:</span>{' '}
                            <span className="font-normal">{returnAddress}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* 3. COD AMOUNT & RETURN BRANCH SECTION (MATCHING REFERENCE IMAGE) */}
                  <div className="border-b-2 border-black grid grid-cols-12 items-stretch">
                    {/* COD Amount Box */}
                    <div className="col-span-5 border-r-2 border-black p-1.5 flex flex-col justify-center">
                      <div className="text-[8.5px] font-bold uppercase text-black">
                        COD Amount:
                      </div>
                      <div className="text-[16px] font-black font-mono tracking-tight text-black leading-tight pt-0.5">
                        {paymentMethod === 'advance' ? (
                          <span>Rs 0 (PAID)</span>
                        ) : (
                          <span>Rs {codAmount.toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Center Column Spacer */}
                    <div className="col-span-3 border-r-2 border-black p-1 flex flex-col items-center justify-center text-center text-[7px] font-mono text-gray-700">
                      <div>HASNAIN ZARRI</div>
                      <div className="text-[6px] text-gray-500 font-sans">OFFICIAL DISPATCH</div>
                    </div>

                    {/* Return Branch Box */}
                    <div className="col-span-4 p-1.5 flex flex-col justify-center text-[7.5px] leading-snug">
                      <div>
                        <span className="font-bold">Return Branch:</span>{' '}
                        <span className="font-medium">{returnBranch || 'Liaqatpur Main Hub (Peshawar Division)'}</span>
                      </div>
                      <div>
                        <span className="font-bold">Address:</span>{' '}
                        <span className="font-medium">Same as above</span>
                      </div>
                    </div>
                  </div>

                  {/* 4. BOTTOM 3 BOXES (REMARKS, PRINT/ORDER ID, PRODUCT) */}
                  <div className="border-b-2 border-black grid grid-cols-12 items-stretch text-[7.5px]">
                    {/* Box 1: Remarks */}
                    <div className="col-span-4 border-r-2 border-black p-1">
                      <span className="font-bold text-black">Remarks:</span>{' '}
                      <span className="font-medium text-black break-words">{remarks}</span>
                    </div>

                    {/* Box 2: Print Date, Order ID & Secondary Barcode */}
                    <div className="col-span-4 border-r-2 border-black p-1 flex flex-col justify-between">
                      <div className="leading-tight">
                        <div>
                          <span className="font-bold">Print On :</span>{' '}
                          <span className="font-mono">{printDate}</span>
                        </div>
                        <div>
                          <span className="font-bold">Order ID :</span>{' '}
                          <span className="font-mono font-black">{order.id}</span>
                        </div>
                      </div>
                      <div className="pt-1 flex flex-col items-center justify-center text-center">
                        <svg
                          height="16"
                          width="100%"
                          viewBox={`0 0 ${secondaryBarcode.totalWidth} 16`}
                          preserveAspectRatio="none"
                          className="h-[14px] max-w-[110px]"
                        >
                          {secondaryBarcode.bars.map((bar, idx) => {
                            if (!bar.isBlack) return null;
                            return (
                              <rect
                                key={idx}
                                x={bar.x}
                                y="0"
                                width={bar.width}
                                height="16"
                                fill="#000000"
                              />
                            );
                          })}
                        </svg>
                        <div className="font-mono text-[6px] tracking-widest text-black">
                          *{order.id}*
                        </div>
                      </div>
                    </div>

                    {/* Box 3: Product Description */}
                    <div className="col-span-4 p-1 leading-tight">
                      <span className="font-bold text-black">Product:</span>{' '}
                      <span className="font-medium text-black">
                        {pieces} PC {productTitle} (Size: {productSize})
                      </span>
                    </div>
                  </div>

                </div>

                {/* 5. BOTTOM DISCLAIMER (URDU TEXT EXACTLY AS IN REFERENCE COURIER AIRWAY BILL) */}
                <div className="pt-1 text-[6.5px] leading-tight text-right dir-rtl font-serif text-black border-t border-black mt-1">
                  نوٹ: ۱) اگر پیکنگ برقرار نہیں ہے تو پارسل قبول نہ کریں۔ ۲) پروڈکٹ کے معیار اور گارنٹی کے لیے ہماری دکان سے رابطہ کریں۔ ۳) پارسل کھولنے اور چیک کرنے کی مکمل اجازت ہے۔
                </div>

              </div>

              {/* Printable Thermal Label Helper Notes */}
              <div className="no-print mt-4 p-3 bg-neutral-800 rounded-xl border border-neutral-700 text-xs text-gray-300 max-w-[420px] text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
                  <PackageCheck className="w-4 h-4" />
                  <span>Exact 100mm × 150mm Airway Bill Dimensions</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Ready to print directly onto thermal sticker roll (4×6") or A6/A4 paper. All M&P branding replaced with Hasnain Zarri Chappal Store.
                </p>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('edit')}
                    className="text-amber-400 underline font-semibold text-xs cursor-pointer"
                  >
                    Edit Label Details
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-md font-bold text-xs cursor-pointer"
                  >
                    Print Now
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="no-print bg-neutral-950 border-t border-neutral-800 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${order.status === 'Printed' || marked ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>
              Label Status: <strong className="text-gray-200">{order.status === 'Printed' || marked ? 'Printed' : 'Ready to Print'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {trackingNumber && (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(trackingNumber);
                  setCopiedTracking(true);
                  setTimeout(() => setCopiedTracking(false), 2000);
                }}
                className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copiedTracking ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTracking ? 'Copied' : 'Copy Tracking #'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-gray-300 font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
