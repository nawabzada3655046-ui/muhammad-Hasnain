import React from 'react';
import { Sparkles, ArrowUpRight, PackageCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

interface RunningBannerProps {
  onSelectProduct: (product: Product) => void;
}

export const RunningBanner: React.FC<RunningBannerProps> = ({ onSelectProduct }) => {
  const { products, bannerConfig } = useStore();

  if (!bannerConfig.enableRunningBanner) {
    return null;
  }

  // Filter products selected for the running ticker
  const runningProducts = products.filter(
    (p) => p.isActive && (p.inRunningBanner || p.isFeatured)
  );

  if (runningProducts.length === 0) {
    return null;
  }

  // Duplicate items to make the infinite seamless loop continuous
  const displayItems = [...runningProducts, ...runningProducts, ...runningProducts];

  return (
    <div className="bg-gray-50 border-y border-gray-200 py-3 relative overflow-hidden select-none">
      
      {/* Header Label Tag on the left */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center bg-gradient-to-r from-gray-50 via-gray-50 to-transparent pl-4 pr-8 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 border border-amber-300 text-amber-800 font-bold text-xs uppercase tracking-wider shadow-xs">
          <Sparkles className="w-3.5 h-3.5 fill-amber-500" />
          <span className="hidden sm:inline">Featured Showcase</span>
        </div>
      </div>

      {/* Right Gradient Fade */}
      <div className="absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />

      {/* Ticker Track */}
      <div className="flex animate-marquee hover:[animation-play-state:paused] items-center space-x-6 pl-24">
        {displayItems.map((product, idx) => {
          const discountPercent =
            product.oldPrice && product.oldPrice > product.price
              ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
              : null;

          return (
            <div
              key={`${product.id}-${idx}`}
              onClick={() => onSelectProduct(product)}
              className="flex items-center gap-3.5 bg-white hover:bg-amber-50/50 border border-gray-200 hover:border-amber-400 rounded-xl p-2 pr-4 transition-all duration-200 cursor-pointer shrink-0 shadow-xs hover:shadow-md group"
            >
              {/* Product Thumbnail with Golden Glow Halo */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-amber-50/30 shrink-0 border border-amber-300/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] relative">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Product Info */}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-1 max-w-[170px] sm:max-w-[210px]">
                    {product.title}
                  </h4>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-amber-700 font-mono">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="text-[10px] text-gray-400 line-through">
                      Rs. {product.oldPrice.toLocaleString()}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="text-[9px] bg-red-50 text-red-600 border border-red-200 font-bold px-1.5 py-0.2 rounded">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-[8px] font-black bg-black text-yellow-400 border border-yellow-400/80 px-1.5 py-0.2 rounded uppercase tracking-wider">
                    <PackageCheck className="w-2.5 h-2.5 text-yellow-400 stroke-[2.5]" />
                    <span>ALLOWED TO OPEN PARCEL</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
