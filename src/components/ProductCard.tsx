import React from 'react';
import { MessageCircle, Eye, Check, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { getProductWhatsAppUrl } from '../utils/whatsapp';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onQuickAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewProduct,
}) => {
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const defaultSize = product.sizes[0] || 'Standard';

  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stockQuantity <= 0;
  const isLimited = product.stockStatus === 'limited';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getProductWhatsAppUrl(product, defaultSize, 1), '_blank');
  };

  return (
    <div 
      onClick={() => onViewProduct(product)}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
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
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
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

        {/* Quick View Hover Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-amber-50 text-gray-900 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300"
          >
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Quick View</span>
          </button>
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

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          
          {/* View Product Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="w-full py-2.5 px-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span>View Details</span>
          </button>

          {/* WhatsApp Order Button */}
          <button
            type="button"
            onClick={handleWhatsAppClick}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-[#25D366] hover:bg-[#20ba59] text-white shadow-green-600/20 hover:scale-[1.02]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>WhatsApp</span>
          </button>

        </div>

      </div>
    </div>
  );
};
