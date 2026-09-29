import React, { useState } from 'react';
import { Printer, X, Check, PackageCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { Order } from '../../types';
import { STORE_ADDRESS, STORE_WHATSAPP_NUMBER } from '../../utils/whatsapp';

interface ShippingLabelModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPrinted: (orderId: string) => void;
}

// Generate realistic SVG barcode lines for the internal Order ID
function generateBarcodeLines(code: string) {
  const bars: { width: number; isBlack: boolean }[] = [];
  // Guard bars
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 3, isBlack: true });

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i);
    const pattern = (charCode * 7 + 13) % 32;
    for (let bit = 0; bit < 5; bit++) {
      const isBlack = ((pattern >> bit) & 1) === 1;
      const width = ((charCode + bit) % 3) + 1.5;
      bars.push({ width, isBlack });
    }
    bars.push({ width: 2, isBlack: false });
  }

  // End guard bars
  bars.push({ width: 3, isBlack: true });
  bars.push({ width: 2, isBlack: false });
  bars.push({ width: 3, isBlack: true });

  return bars;
}

export const ShippingLabelModal: React.FC<ShippingLabelModalProps> = ({
  order,
  isOpen,
  onClose,
  onMarkAsPrinted,
}) => {
  const [marked, setMarked] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleMarkPrintedClick = () => {
    onMarkAsPrinted(order.id);
    setMarked(true);
  };

  const barcodeBars = generateBarcodeLines(order.id);
  const totalBarcodeWidth = barcodeBars.reduce((acc, b) => acc + b.width, 0);

  // Total quantity of footwear pairs
  const totalPieces = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white animate-in fade-in duration-150">
      
      {/* Print-specific style tag ensuring only the label prints and sizes correctly */}
      <style>{`
        @media print {
          @page {
            size: 4in 6in;
            margin: 0.15in;
          }
          html, body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
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
            width: 3.75in !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 8px !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: 2px solid #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        className="relative w-full max-w-xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:max-w-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print bg-black text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <h3 className="font-bold text-base sm:text-lg text-yellow-400">
                Courier Shipping Label
              </h3>
              <span className="text-[11px] font-mono bg-neutral-800 px-2 py-0.5 rounded text-gray-300">
                #{order.id}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              4×6" Thermal Label & Normal A4 Printer Compatible
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mark as Printed Button */}
            <button
              type="button"
              onClick={handleMarkPrintedClick}
              disabled={order.status === 'Printed' || marked}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                order.status === 'Printed' || marked
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-600/50'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-gray-200 border border-neutral-600'
              }`}
            >
              {order.status === 'Printed' || marked ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Printed</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Mark as Printed</span>
                </>
              )}
            </button>

            {/* Print Label Action */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print Label</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-800 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container for Preview */}
        <div className="p-4 sm:p-6 max-h-[82vh] overflow-y-auto bg-neutral-950 flex justify-center print:p-0 print:bg-white print:max-h-none print:overflow-visible">
          
          {/* THE PRINTABLE LABEL CONTAINER (4x6 Aspect Ratio, High-Contrast Black & White Courier Styling) */}
          <div 
            id="printable-shipping-label" 
            className="w-full max-w-[390px] bg-white text-black border-2 border-black p-4 font-sans select-text shadow-xl print:shadow-none print:border-2 print:border-black print:max-w-none text-xs"
          >
            {/* Header: STORE: Hasnain Tech Store */}
            <div className="border-b-2 border-black pb-2 mb-2 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold tracking-widest uppercase text-gray-700">
                  OFFICIAL DISPATCH
                </div>
                <h1 className="text-xl font-black tracking-tight uppercase leading-none">
                  HASNAIN TECH STORE
                </h1>
                <div className="text-[10px] font-bold text-gray-800">
                  Hasnain Zarri Chappal • Premium Handcrafted Footwear
                </div>
              </div>

              <div className="text-right">
                <div className="border-2 border-black px-2 py-1 font-mono font-black text-sm uppercase bg-black text-white">
                  {order.paymentMethod === 'advance' ? 'PAID' : 'COD'}
                </div>
                <div className="text-[9px] font-bold mt-0.5 text-gray-700">
                  {formattedDate}
                </div>
              </div>
            </div>

            {/* Internal Barcode & Order ID */}
            <div className="border-b-2 border-black pb-2 mb-2 text-center">
              <div className="font-mono text-sm font-black tracking-wider uppercase mb-1">
                ORDER ID: {order.id}
              </div>

              {/* Vector Barcode */}
              <div className="flex justify-center items-center py-1">
                <svg
                  height="45"
                  width="100%"
                  viewBox={`0 0 ${totalBarcodeWidth} 45`}
                  preserveAspectRatio="none"
                  className="max-w-[280px] h-[40px]"
                >
                  {(() => {
                    let currentX = 0;
                    return barcodeBars.map((bar, idx) => {
                      const x = currentX;
                      currentX += bar.width;
                      if (!bar.isBlack) return null;
                      return (
                        <rect
                          key={idx}
                          x={x}
                          y="0"
                          width={bar.width}
                          height="45"
                          fill="#000000"
                        />
                      );
                    });
                  })()}
                </svg>
              </div>

              <div className="text-[8px] font-bold tracking-widest uppercase text-gray-600">
                * INTERNAL STORE ORDER ID BARCODE *
              </div>
            </div>

            {/* Destination / Customer (DELIVER TO) Section */}
            <div className="border-b-2 border-black pb-2 mb-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-gray-600 mb-1">
                <span>DELIVER TO (CONSIGNEE):</span>
                <span>DESTINATION</span>
              </div>

              {/* Big Bold Destination City Box */}
              <div className="border-2 border-black bg-gray-100 p-1.5 mb-1.5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold uppercase text-gray-600 block">CITY:</span>
                  <span className="text-base font-black uppercase tracking-wide">
                    {order.city || 'PAKISTAN'}
                  </span>
                </div>
                {order.postalCode && (
                  <div className="text-right font-mono font-bold text-xs">
                    ZIP: {order.postalCode}
                  </div>
                )}
              </div>

              {/* Customer Name & Phone */}
              <div className="space-y-0.5">
                <div className="text-sm font-black uppercase tracking-tight">
                  {order.customerName}
                </div>
                <div className="font-mono text-xs font-bold">
                  TEL: {order.contactNumber}
                  {order.whatsappNumber && order.whatsappNumber !== order.contactNumber && (
                    <span className="ml-2 font-normal text-gray-800">/ WA: {order.whatsappNumber}</span>
                  )}
                </div>
                <div className="text-xs font-semibold leading-snug pt-0.5">
                  <span className="font-bold">ADDR:</span> {order.address}
                </div>
              </div>
            </div>

            {/* Package Contents Table */}
            <div className="border-b-2 border-black pb-2 mb-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-600 mb-1">
                <span>ORDER ITEMS ({totalPieces} {totalPieces === 1 ? 'PIECE' : 'PIECES'})</span>
                <span>PRICE</span>
              </div>

              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-xs border-b border-gray-200 pb-1 last:border-none">
                    <div className="flex-1 pr-2">
                      <div className="font-bold leading-tight uppercase">
                        {item.product.title}
                      </div>
                      <div className="text-[10px] text-gray-700 font-medium">
                        Size: <strong>{item.selectedSize}</strong> • Qty: <strong>{item.quantity}</strong>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-right shrink-0">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COD Amount Box - Large & Prominent */}
            <div className="border-2 border-black p-2 mb-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-gray-700">
                    C.O.D. CASH TO COLLECT:
                  </div>
                  <div className="text-xl font-black font-mono tracking-tight">
                    {order.paymentMethod === 'advance' ? (
                      <span className="text-base">Rs. 0 (ALREADY PAID)</span>
                    ) : (
                      <span>Rs. {order.finalAmount.toLocaleString()} PKR</span>
                    )}
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono leading-tight">
                  <div>Subtotal: Rs. {order.subtotal.toLocaleString()}</div>
                  {order.discount > 0 && <div>Disc: -Rs. {order.discount.toLocaleString()}</div>}
                  <div>Delivery: Rs. {order.shippingFee.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Inspection & Instructions Banner */}
            <div className="border-2 border-black bg-black text-white p-1.5 mb-2 text-center">
              <div className="text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                <PackageCheck className="w-3.5 h-3.5 text-yellow-400 stroke-[2.5]" />
                <span>ALLOWED TO OPEN PARCEL & CHECK BEFORE PAYMENT</span>
              </div>
            </div>

            {/* Return Address & Store Contact */}
            <div className="text-[9px] leading-tight text-gray-800 border-t border-dashed border-gray-400 pt-1.5">
              <div className="font-bold uppercase">RETURN ADDRESS IF UNDELIVERED:</div>
              <div>
                <strong>Hasnain Tech Store</strong> • {STORE_ADDRESS}
              </div>
              <div className="font-mono">
                Helpline / WhatsApp: <strong>{STORE_WHATSAPP_NUMBER}</strong> • Liaqatpur, Pakistan
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="no-print bg-neutral-900 border-t border-neutral-800 p-3 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0" />
          <span>
            Print to 4×6 inch thermal sticker or standard A4 paper. You can mark as Printed without booking to M&P Courier.
          </span>
        </div>
      </div>
    </div>
  );
};
