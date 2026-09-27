import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { STORE_WHATSAPP_NUMBER, getGeneralWhatsAppUrl } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedCheckout,
}) => {
  const { cart, removeFromCart, updateCartQuantity } = useStore();

  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const potentialAdvanceDiscount = Math.round(subtotal * 0.05);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs transition-opacity">
      <div 
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-luxury font-bold text-lg text-gray-900">Your Shopping Cart</h3>
                <span className="text-xs text-gray-500">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 font-serif-luxury">Your Cart is Empty</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-xs">
                    Explore our handcrafted Zarri Chappal & Khussa collection and add your favorite pairs.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* 5% Advance payment banner incentive */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-800">Get 5% OFF with Advance Payment!</span>
                    <p className="text-amber-700 text-[11px] mt-0.5">
                      Pay via Easypaisa or UBL Bank at checkout to save extra Rs. {potentialAdvanceDiscount.toLocaleString()}.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedSize}`}
                      className="p-3.5 rounded-xl bg-white border border-gray-200 flex gap-3.5 items-center justify-between shadow-xs hover:border-gray-300"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-200">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 line-clamp-1">
                          {item.product.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-amber-700 font-mono font-bold">
                            Rs. {item.product.price.toLocaleString()}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold border border-gray-200">
                            Size: {item.selectedSize}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center bg-gray-50 border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.selectedSize,
                                  item.quantity - 1
                                )
                              }
                              className="p-1.5 text-gray-600 hover:text-gray-900"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-bold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.selectedSize,
                                  item.quantity + 1
                                )
                              }
                              className="p-1.5 text-gray-600 hover:text-gray-900"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-gray-50/70 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Subtotal</span>
                  <span className="font-mono text-gray-900 font-bold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-xs">
                  <span>Delivery across Pakistan</span>
                  <span className="text-emerald-600 font-bold uppercase text-[11px]">Free</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-base pt-2 border-t border-gray-200">
                  <span>Estimated Total</span>
                  <span className="font-mono text-lg text-amber-700">Rs. {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={onProceedCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                <a
                  href={getGeneralWhatsAppUrl(`Assalam-o-Alaikum Hasnain Zarri Chappal Store! I have ${cart.length} item(s) in my cart totaling Rs. ${subtotal.toLocaleString()}. Can you help me finalize my order?`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                  <span>Order Directly on WhatsApp ({STORE_WHATSAPP_NUMBER})</span>
                </a>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
