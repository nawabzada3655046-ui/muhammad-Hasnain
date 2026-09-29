import React from 'react';
import { MessageCircle, Check, AlertCircle, PackageCheck, Zap } from 'lucide-react';
import { Product } from '../types';
import { getProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  onViewProduct?: (product: Product) => void;
  onQuickAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onBuyNow,
}) => {
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'Standard';

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity <= 0;
  const isLimited = product.stockStatus === 'limited';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getProductWhatsAppUrl(product, defaultSize, 1), '_blank');
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBuyNow(product);
  };

  return (
    <div 
      id={`product-${product.id}`}
      onClick={() => onBuyNow(product)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-yellow-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* Top Image Container with Golden Glow Light Halo */}
      <div className="relative aspect-square w-full overflow-hidden bg-amber-50/20 border-b border-amber-200/60 shadow-[0_0_20px_rgba(245,158,11,0.18)] group-hover:shadow-[0_0_28px_rgba(245,158,11,0.32)] transition-shadow duration-500">
        
        {/* Soft Golden Glow / Light Halo Behind Image */}
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center -z-0 overflow-hidden"
          aria-hidden="true"
        >
          <div 
            className="w-4/5 h-4/5 rounded-full blur-2xl opacity-60 group-hover:opacity-85 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle, rgba(245, 158, 11, 0.45) 0%, rgba(234, 179, 8, 0.25) 50%, transparent 75%)',
            }}
          />
        </div>

        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="relative z-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Soft Golden Light Halo Around Outside Edges of Image */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            boxShadow: 'inset 0 0 28px 4px rgba(245, 158, 11, 0.22), inset 0 0 10px 1px rgba(251, 191, 36, 0.28)',
          }}
          aria-hidden="true"
        />

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none z-10">
          <div className="flex flex-col gap-1.5">
            {discountPercent && (
              <span className="inline-block bg-red-600 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider">
                {discountPercent}% OFF
              </span>
            )}
            {product.isNewArrival && (
              <span className="inline-block bg-amber-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded shadow uppercase tracking-wider">
                New Arrival
              </span>
            )}
          </div>

          {/* Stock Status Badge */}
          <div>
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">
                <AlertCircle className="w-3 h-3" />
                Sold Out
              </span>
            ) : isLimited ? (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-300 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs animate-pulse">
                Limited Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">
                <Check className="w-3 h-3" />
                In Stock
              </span>
            )}
          </div>
        </div>

        {/* Clearly Visible "ALLOWED TO OPEN PARCEL" Badge on Product Image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 pointer-events-none">
          <div className="bg-black/95 backdrop-blur-xs text-yellow-400 border border-yellow-400/90 py-1.5 px-2 sm:px-2.5 rounded-xl shadow-lg flex items-center justify-center gap-1.5 text-center transition-transform group-hover:scale-[1.02]">
            <PackageCheck className="w-3.5 h-3.5 text-yellow-400 shrink-0 stroke-[2.5]" />
            <span className="font-black text-[9.5px] sm:text-[10.5px] tracking-wide text-yellow-400 uppercase drop-shadow-xs whitespace-nowrap">
              ALLOWED TO OPEN PARCEL
            </span>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        
        {/* Category & Title */}
        <div>
          <span className="text-[11px] font-bold text-amber-700 tracking-wider uppercase block mb-1">
            {product.category}
          </span>
          <h3 className="font-serif-luxury font-bold text-base sm:text-lg text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1">
            {product.title}
          </h3>
        </div>

        {/* Price & Old Price */}
        <div className="flex items-baseline gap-2.5">
          <span className="text-lg sm:text-xl font-extrabold text-gray-900 font-mono">
            Rs. {product.price.toLocaleString()}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="text-xs sm:text-sm text-gray-400 line-through font-mono">
              Rs. {product.oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ALLOWED TO OPEN PARCEL Badge in Card Content */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black text-yellow-400 border border-yellow-400/90 text-[10px] font-black uppercase tracking-wider shadow-2xs">
            <PackageCheck className="w-3 h-3 text-yellow-400 shrink-0 stroke-[2.5]" />
            <span>ALLOWED TO OPEN PARCEL</span>
          </span>
        </div>

        {/* Available Sizes List */}
        <div>
          <div className="text-[11px] text-gray-500 mb-1.5 font-medium flex items-center justify-between">
            <span>Available Sizes:</span>
            <span className="text-[10px] text-amber-700 font-semibold">Standard Fit</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes.map((size) => (
              <span
                key={size}
                className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-700 group-hover:border-amber-300"
              >
                {size}
              </span>
            ))}
          </div>
        </div>

        {/* Exactly Two Buttons Side by Side: Order on WhatsApp & Buy Now */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          
          {/* 1. Order on WhatsApp Button - Green button with WhatsApp icon */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-1.5 sm:px-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-[#25D366] hover:bg-[#20ba59] text-white shadow-green-600/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            title="Order directly on WhatsApp"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span className="truncate">Order on WhatsApp</span>
          </button>

          {/* 2. Buy Now Button - Yellow button with black text matching black and yellow theme */}
          <button
            type="button"
            onClick={handleBuyNowClick}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-1.5 sm:px-2 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-yellow-400 hover:bg-yellow-500 text-black border border-yellow-500 shadow-yellow-500/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            title="Buy Now - Instant Checkout"
          >
            <Zap className="w-3.5 h-3.5 fill-black shrink-0" />
            <span className="truncate">Buy Now</span>
          </button>

        </div>

      </div>
    </div>
  );
};
