import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Truck, 
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { getProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCart,
}) => {
  const { addToCart } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | number>('Standard');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  // Reset and sync state whenever product changes
  React.useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setSelectedSize(product.sizes?.[0] || 'Standard');
      setQuantity(1);
      setAddedToast(false);
    }
  }, [product]);

  if (!product) return null;

  const images = product.images && product.images.length > 0 ? product.images : [''];

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, selectedSize, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleWhatsAppOrder = () => {
    const url = getProductWhatsAppUrl(product, selectedSize, quantity);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 border border-gray-200 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 p-5 sm:p-8 max-h-[88vh] overflow-y-auto">
          
          {/* Left Column: Gallery */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Main Featured Image Display with Soft Golden Glow */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-amber-50/20 border border-amber-300/70 shadow-[0_0_35px_rgba(245,158,11,0.22)] group">
              
              {/* Soft Golden Glow / Light Halo Behind Image */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center -z-0 overflow-hidden"
                aria-hidden="true"
              >
                <div 
                  className="w-4/5 h-4/5 rounded-full blur-3xl opacity-60 group-hover:opacity-85 transition-opacity duration-500"
                  style={{
                    background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(234, 179, 8, 0.25) 50%, transparent 75%)',
                  }}
                />
              </div>

              <img
                src={images[activeImageIndex]}
                alt={product.title}
                className="relative z-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />

              {/* Soft Golden Light Halo Around Outside Edges of Image */}
              <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  boxShadow: 'inset 0 0 35px 6px rgba(245, 158, 11, 0.22), inset 0 0 12px 2px rgba(251, 191, 36, 0.25)',
                }}
                aria-hidden="true"
              />

              {/* Prev / Next controls if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Badges on modal image */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {discountPercent && (
                  <span className="bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow">
                    {discountPercent}% OFF
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow">
                    New Arrival
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Handcraft Heritage Trust Info */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-700 font-bold">
                <Sparkles className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>Authentic Pakistani Craftsmanship</span>
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Handmade by master artisans with pure cow leather inner and durable double-welted stitching. Built for both royal grandeur and lasting daily durability.
              </p>
            </div>

          </div>

          {/* Right Column: Details & Actions */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-5">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-bold">
                  {product.category}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    isOutOfStock
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : 'In Stock & Ready to Dispatch'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-gray-900 leading-tight">
                {product.title}
              </h2>

              {/* Price Details */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-base text-gray-400 line-through font-mono">
                    Rs. {product.oldPrice.toLocaleString()}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-xs bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded">
                    Save Rs. {(product.oldPrice! - product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Advance Payment Banner Highlight */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
                <span className="font-medium">⚡ Pay via Easypaisa / UBL Bank:</span>
                <span className="font-extrabold text-amber-700 font-mono">
                  Rs. {Math.round(product.price * 0.95).toLocaleString()} (5% OFF)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Size (Pakistani / Euro Standard):
                </label>
                <span className="text-xs text-amber-700 font-semibold underline cursor-pointer">
                  Standard Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-3.5 rounded-xl font-bold text-sm transition-all ${
                      selectedSize === size
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                        : 'bg-gray-50 text-gray-700 border border-gray-300 hover:border-amber-400'
                    }`}
                  >
                    Size {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-50 border border-gray-300 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-bold font-mono text-gray-900 text-base">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-gray-600">
                  Total: <strong className="text-gray-900 font-mono text-sm">Rs. {(product.price * quantity).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="space-y-3 pt-2">
              
              {/* Order on WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppOrder}
                disabled={isOutOfStock}
                className="w-full py-4 px-6 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg shadow-green-600/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <MessageCircle className="w-6 h-6 fill-white" />
                <span>Order on WhatsApp (Size: {selectedSize})</span>
              </button>

              {/* Add to Cart */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 border transition-all ${
                    addedToast
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  }`}
                >
                  {addedToast ? (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onOpenCart}
                  className="py-3.5 px-5 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  View Cart
                </button>
              </div>

            </div>

            {/* Shipping & Delivery Guarantee */}
            <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Free & Fast Delivery in Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Size Exchange Available</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
