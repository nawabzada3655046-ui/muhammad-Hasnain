import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { RunningBanner } from './components/RunningBanner';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { WhyChooseUs } from './components/WhyChooseUs';
import { AdvancePaymentBanner } from './components/AdvancePaymentBanner';
import { WhatsAppCTA } from './components/WhatsAppCTA';
import { Footer } from './components/Footer';
import { PolicyModals } from './components/PolicyModals';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { Product, Order } from './types';
import { Sparkles, ChevronRight } from 'lucide-react';

function StoreMain() {
  const { 
    products, 
    categories, 
    searchQuery, 
    selectedCategory, 
    setSelectedCategory,
    setSearchQuery,
    addToCart
  } = useStore();

  // Modals & Navigation state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | null>(null);

  // Filtered active products
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  // Main catalog filtered by category and search
  const catalogProducts = useMemo(() => {
    return activeProducts.filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All Products') return true;
      if (selectedCategory === 'New Arrivals') return product.isNewArrival;
      if (selectedCategory === 'Featured Products') return product.isFeatured;
      if (selectedCategory === "Men's Chappal") return product.category.includes("Men's Chappal");
      if (selectedCategory === "Men's Khussa") return product.category.includes("Men's Khussa");
      if (selectedCategory === "Women's Chappal") return product.category.includes("Women's Chappal");
      if (selectedCategory === "Women's Khussa") return product.category.includes("Women's Khussa");

      return product.category === selectedCategory;
    });
  }, [activeProducts, selectedCategory, searchQuery]);

  // Specific section slices
  const featuredProducts = useMemo(() => {
    return activeProducts.filter((p) => p.isFeatured).slice(0, 4);
  }, [activeProducts]);

  const mensProducts = useMemo(() => {
    return activeProducts.filter((p) => p.category.includes("Men's")).slice(0, 4);
  }, [activeProducts]);

  const womensProducts = useMemo(() => {
    return activeProducts.filter((p) => p.category.includes("Women's")).slice(0, 4);
  }, [activeProducts]);

  // Navigation handlers
  const handleNavigateCategory = (cat: string) => {
    setSelectedCategory(cat);
    const element = document.getElementById('catalog-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickAddToCart = (product: Product) => {
    const size = product.sizes[0] || 'Standard';
    addToCart(product, size, 1);
  };

  const handleOrderSuccess = (order: Order) => {
    setCheckoutOpen(false);
    setConfirmedOrder(order);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between selection:bg-amber-400 selection:text-black">
      
      {/* 1. Header with brand, nav, cart, WhatsApp */}
      <Header
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onNavigateCategory={handleNavigateCategory}
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1 space-y-2">
        
        {/* 2. Hero Banner */}
        <HeroBanner onShopNow={() => handleScrollToSection('catalog-section')} />

        {/* 3. Running Product Banner (Continuous marquee) */}
        <RunningBanner onSelectProduct={(p) => setSelectedProduct(p)} />

        {/* Active Search Notification Banner if searching */}
        {searchQuery && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-between shadow-2xs">
              <div>
                <span className="text-xs text-gray-600">Search results for:</span>
                <span className="text-sm font-bold text-gray-900 ml-2 font-mono">"{searchQuery}"</span>
                <span className="text-xs text-gray-500 ml-2">({catalogProducts.length} items found)</span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-amber-700 underline font-semibold"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}

        {/* 4. FEATURED PRODUCTS SECTION */}
        {featuredProducts.length > 0 && !searchQuery && (
          <section id="featured-section" className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-200">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-bold uppercase tracking-widest mb-1">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>Masterpiece Heritage</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-gray-900">
                  Featured Zarri Chappal & Khussa
                </h2>
              </div>
              <button
                onClick={() => handleNavigateCategory('Featured Products')}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider"
              >
                <span>View All Featured</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={(p) => setSelectedProduct(p)}
                  onQuickAddToCart={handleQuickAddToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* 5. MAIN CATALOG / CATEGORY SELECTOR SECTION */}
        <section id="catalog-section" className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Category Pills */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-gray-200">
              <div>
                <span className="text-xs text-amber-700 font-bold uppercase tracking-widest block mb-1">
                  Complete Footwear Catalog
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-gray-900">
                  {selectedCategory === 'All Products' ? 'All Handcrafted Collections' : selectedCategory}
                </h2>
              </div>

              <div className="text-xs text-gray-500">
                Showing <strong className="text-gray-900 font-mono">{catalogProducts.length}</strong> handcrafted pairs
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === category
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-102'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 hover:border-amber-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          {catalogProducts.length === 0 ? (
            <div className="p-12 text-center bg-gray-50 border border-gray-200 rounded-3xl space-y-3">
              <p className="text-base text-gray-600 font-medium">
                No products found matching your current filter.
              </p>
              <button
                onClick={() => { setSelectedCategory('All Products'); setSearchQuery(''); }}
                className="px-5 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold uppercase shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {catalogProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={(p) => setSelectedProduct(p)}
                  onQuickAddToCart={handleQuickAddToCart}
                />
              ))}
            </div>
          )}

        </section>

        {/* 6. MEN'S COLLECTION SECTION (When not in specific filtered search) */}
        {!searchQuery && selectedCategory === 'All Products' && mensProducts.length > 0 && (
          <section className="py-12 bg-gray-50 border-y border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-200">
                <div>
                  <span className="text-xs text-amber-700 font-bold uppercase tracking-widest block mb-1">
                    Men’s Peshawari & Khussa
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-gray-900">
                    Men's Traditional Footwear
                  </h2>
                </div>
                <button
                  onClick={() => handleNavigateCategory("Men's Chappal")}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider"
                >
                  <span>Explore Men's</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {mensProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewProduct={(p) => setSelectedProduct(p)}
                    onQuickAddToCart={handleQuickAddToCart}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 7. WOMEN'S COLLECTION SECTION */}
        {!searchQuery && selectedCategory === 'All Products' && womensProducts.length > 0 && (
          <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-8 pb-3 border-b border-gray-200">
              <div>
                <span className="text-xs text-amber-700 font-bold uppercase tracking-widest block mb-1">
                  Women’s Zarri & Bridal Khussa
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif-luxury text-gray-900">
                  Women's Handcrafted Collection
                </h2>
              </div>
              <button
                onClick={() => handleNavigateCategory("Women's Khussa")}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 uppercase tracking-wider"
              >
                <span>Explore Women's</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {womensProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={(p) => setSelectedProduct(p)}
                  onQuickAddToCart={handleQuickAddToCart}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. ADVANCE PAYMENT 5% DISCOUNT BANNER */}
        <AdvancePaymentBanner onShopNow={() => handleScrollToSection('catalog-section')} />

        {/* 9. WHY CHOOSE US TRUST SECTION */}
        <WhyChooseUs />

        {/* 10. WHATSAPP ORDER CTA SECTION & FLOATING BUTTON */}
        <WhatsAppCTA />

      </main>

      {/* 11. FOOTER */}
      <Footer
        onNavigateCategory={handleNavigateCategory}
        onScrollToSection={handleScrollToSection}
        onOpenPrivacy={() => setPolicyType('privacy')}
        onOpenTerms={() => setPolicyType('terms')}
      />

      {/* PRODUCT DETAIL MODAL */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOpenCart={() => {
          setSelectedProduct(null);
          setCartOpen(true);
        }}
      />

      {/* CART DRAWER */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onProceedCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* ORDER CONFIRMATION MODAL */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
      />

      {/* ADMIN DASHBOARD PORTAL */}
      <AdminDashboard
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />

      {/* PRIVACY & TERMS MODAL */}
      <PolicyModals
        type={policyType}
        onClose={() => setPolicyType(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <StoreMain />
    </StoreProvider>
  );
}
