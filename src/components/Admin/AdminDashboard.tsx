import React, { useState } from 'react';
import { 
  Lock, 
  LogOut, 
  Package, 
  ShoppingBag, 
  LayoutDashboard, 
  Image as ImageIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Check, 
  X, 
  Search, 
  MessageCircle, 
  Sparkles, 
  Upload, 
  Clock, 
  ShieldCheck, 
  Layers,
  AlertTriangle,
  RotateCcw,
  Truck,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Order } from '../../types';
import { STORE_WHATSAPP_NUMBER, getCustomerStatusWhatsAppUrl } from '../../utils/whatsapp';
import { MNPCourierIntegration } from './MNPCourierIntegration';
import { MNPShipmentModal } from './MNPShipmentModal';
import { AdminSecuritySettings } from './AdminSecuritySettings';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { 
    products, 
    orders, 
    bannerConfig, 
    categories,
    mnpConfig,
    isAdmin, 
    loginAdmin, 
    logoutAdmin,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleRunningBannerProduct,
    addCategory,
    deleteCategory,
    updateBannerConfig,
    updateOrderStatus,
    deleteOrder,
    updateMNPConfig,
    connectMNP,
    disconnectMNP,
    prepareMNPShipmentBooking,
  } = useStore();

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'banners' | 'categories' | 'courier' | 'security'>('overview');

  // MNP Courier shipment booking state
  const [bookingOrder, setBookingOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  // Product form modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields - strictly adhering to the 6 core required fields
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formOldPrice, setFormOldPrice] = useState<number | undefined>(undefined);
  const [formCategory, setFormCategory] = useState('');
  const [formSizes, setFormSizes] = useState<string>('7, 8, 9, 10, 11');
  const [formStockStatus, setFormStockStatus] = useState<'in_stock' | 'limited' | 'out_of_stock'>('in_stock');
  const [formStockQuantity, setFormStockQuantity] = useState<number>(20);
  const [formDescription, setFormDescription] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsNewArrival, setFormIsNewArrival] = useState(false);
  const [formInRunningBanner, setFormInRunningBanner] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formError, setFormError] = useState('');

  // Banner form state
  const [bannerTitle, setBannerTitle] = useState(bannerConfig.heroTitle);
  const [bannerSubtitle, setBannerSubtitle] = useState(bannerConfig.heroSubtitle);
  const [bannerImage, setBannerImage] = useState(bannerConfig.heroImage);
  const [enableRunningBanner, setEnableRunningBanner] = useState(bannerConfig.enableRunningBanner);
  const [bannerSavedMessage, setBannerSavedMessage] = useState(false);

  // Category input
  const [newCategoryName, setNewCategoryName] = useState('');

  // Order detail & Screenshot Lightbox state
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [viewingScreenshot, setViewingScreenshot] = useState<string | null>(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Product search in admin
  const [productAdminSearch, setProductAdminSearch] = useState('');

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = loginAdmin(passwordInput);
    if (!success) {
      setLoginError('Invalid password. Please enter your valid admin password.');
    } else {
      setPasswordInput('');
    }
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormTitle('');
    setFormPrice(2500);
    setFormOldPrice(3200);
    setFormCategory(categories.find(c => c !== 'All Products') || "Men's Chappal");
    setFormSizes('7, 8, 9, 10, 11');
    setFormStockStatus('in_stock');
    setFormStockQuantity(20);
    setFormDescription('Pure genuine cowhide leather with handcrafted Zarri tilla embroidery. Double sole durability and soft cushioned footbed.');
    setFormImages([]);
    setFormIsFeatured(true);
    setFormIsNewArrival(true);
    setFormInRunningBanner(true);
    setFormIsActive(true);
    setFormError('');
    setProductModalOpen(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setFormTitle(prod.title);
    setFormPrice(prod.price);
    setFormOldPrice(prod.oldPrice);
    setFormCategory(prod.category);
    setFormSizes(prod.sizes.join(', '));
    setFormStockStatus(prod.stockStatus);
    setFormStockQuantity(prod.stockQuantity);
    setFormDescription(prod.description);
    setFormImages([...prod.images]);
    setFormIsFeatured(prod.isFeatured);
    setFormIsNewArrival(prod.isNewArrival);
    setFormInRunningBanner(prod.inRunningBanner);
    setFormIsActive(prod.isActive);
    setFormError('');
    setProductModalOpen(true);
  };

  // Image Upload (JPG, JPEG, PNG, WEBP)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate allowed file types
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setFormError('Please select a valid image file (JPG, JPEG, PNG, WEBP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormImages((prev) => [...prev, result]);
          setFormError('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Replace primary image when editing
  const handleReplacePrimaryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFormError('Please select a valid image file (JPG, JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormImages((prev) => [result, ...prev.slice(1)]);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFormImage = (indexToRemove: number) => {
    setFormImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Save Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Product Title / Product Name is strictly required.');
      return;
    }
    if (formImages.length === 0) {
      setFormError('Product Image Upload is required. Please upload at least one picture (JPG, JPEG, PNG, or WEBP).');
      return;
    }
    if (formPrice <= 0) {
      setFormError('Please enter a valid price in PKR.');
      return;
    }

    const parsedSizes = formSizes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => (isNaN(Number(s)) ? s : Number(s)));

    if (parsedSizes.length === 0) {
      setFormError('Please specify at least one available size (e.g. 7, 8, 9, 10).');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        title: formTitle.trim(),
        price: Number(formPrice),
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        category: formCategory,
        sizes: parsedSizes,
        stockStatus: formStockStatus,
        stockQuantity: Number(formStockQuantity),
        description: formDescription.trim(),
        images: formImages,
        isFeatured: formIsFeatured,
        isNewArrival: formIsNewArrival,
        inRunningBanner: formInRunningBanner,
        isActive: formIsActive,
      });
    } else {
      addProduct({
        title: formTitle.trim(),
        price: Number(formPrice),
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        category: formCategory,
        sizes: parsedSizes,
        stockStatus: formStockStatus,
        stockQuantity: Number(formStockQuantity),
        description: formDescription.trim(),
        images: formImages,
        isFeatured: formIsFeatured,
        isNewArrival: formIsNewArrival,
        inRunningBanner: formInRunningBanner,
        isActive: formIsActive,
      });
    }

    setProductModalOpen(false);
  };

  // Save Banner Config
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    updateBannerConfig({
      heroTitle: bannerTitle,
      heroSubtitle: bannerSubtitle,
      heroImage: bannerImage,
      enableRunningBanner: enableRunningBanner,
    });
    setBannerSavedMessage(true);
    setTimeout(() => setBannerSavedMessage(false), 2500);
  };

  // Banner image upload
  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setBannerImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  // Metrics Calculations
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const outOfStockProducts = products.filter(
    (p) => p.stockStatus === 'out_of_stock' || p.stockQuantity <= 0
  ).length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const advancePaymentOrders = orders.filter((o) => o.paymentMethod === 'advance').length;
  const codOrders = orders.filter((o) => o.paymentMethod === 'cod').length;

  // Filter Orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.customerName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      ord.whatsappNumber.includes(orderSearchQuery) ||
      ord.city.toLowerCase().includes(orderSearchQuery.toLowerCase());

    const matchesStatus =
      orderStatusFilter === 'all' || ord.status.toLowerCase() === orderStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Filter Products for admin table
  const filteredAdminProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productAdminSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productAdminSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900/60 backdrop-blur-xs flex flex-col justify-start">
      
      {/* Top Admin Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-white font-extrabold flex items-center justify-center font-serif-luxury text-sm shadow-xs">
            HZ
          </div>
          <div>
            <h1 className="font-serif-luxury font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <span>Hasnain Zarri Admin Portal</span>
              {isAdmin && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-300 font-mono px-2 py-0.5 rounded-full font-bold">
                  Authorized Session
                </span>
              )}
            </h1>
            <span className="text-[11px] text-gray-500">Store WhatsApp: {STORE_WHATSAPP_NUMBER}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <button
              onClick={logoutAdmin}
              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 hover:text-gray-900 text-gray-600 border border-gray-200 transition-colors"
            title="Close Admin Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* If NOT Admin Logged In: Show Passcode Gate */}
        {!isAdmin ? (
          <div className="max-w-md mx-auto my-12 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif-luxury text-gray-900">
                Admin Authentication
              </h2>
              <p className="text-xs text-gray-500">
                Authorized store managers only. Enter your store management passcode to access products, orders, and banner settings.
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Enter Admin Password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-center text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-500 tracking-widest transition-colors font-mono"
                  autoFocus
                />
                <span className="text-[10px] text-gray-500 mt-1.5 block">
                  Protected store administration. Enter your password to unlock the portal.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-extrabold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                Access Admin Dashboard
              </button>
            </form>
          </div>
        ) : (
          /* Logged In Admin Panel */
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'overview'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'products'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Product Management ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'orders'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders ({orders.length})</span>
                {pendingOrders > 0 && (
                  <span className="bg-red-500 text-white font-extrabold text-[10px] px-1.5 py-0.2 rounded-full">
                    {pendingOrders}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('banners')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'banners'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Banner Management</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'categories'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Categories</span>
              </button>

              <button
                onClick={() => setActiveTab('courier')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'courier'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>MNP Courier Integration</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                  mnpConfig.isConnected
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}>
                  {mnpConfig.isConnected ? 'Connected' : 'Not Connected'}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'security'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Settings / Security</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW METRICS */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* 7 Key Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  
                  {/* Total Products */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <span>Total Products</span>
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
                      {totalProducts}
                    </div>
                    <span className="text-[11px] text-gray-500 block">Catalog inventory</span>
                  </div>

                  {/* Active Products */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <span>Active Products</span>
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">
                      {activeProducts}
                    </div>
                    <span className="text-[11px] text-gray-500 block">Visible to customers</span>
                  </div>

                  {/* Out of Stock Products */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <span>Out of Stock</span>
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-red-600 font-mono">
                      {outOfStockProducts}
                    </div>
                    <span className="text-[11px] text-gray-500 block">Needs restocking</span>
                  </div>

                  {/* Total Orders */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <span>Total Orders</span>
                      <ShoppingBag className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono">
                      {totalOrders}
                    </div>
                    <span className="text-[11px] text-gray-500 block">All time orders</span>
                  </div>

                  {/* Pending Orders */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <span>Pending Orders</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 font-mono">
                      {pendingOrders}
                    </div>
                    <span className="text-[11px] text-gray-500 block">Awaiting confirmation</span>
                  </div>

                  {/* Advance Payment Orders */}
                  <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between text-amber-800 text-xs font-semibold">
                      <span>Advance (5% OFF)</span>
                      <Sparkles className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-mono">
                      {advancePaymentOrders}
                    </div>
                    <span className="text-[11px] text-amber-700 block">Easypaisa & UBL Bank</span>
                  </div>

                  {/* COD Orders */}
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-xs">
                      <span>COD Orders</span>
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-blue-700 font-mono">
                      {codOrders}
                    </div>
                    <span className="text-[11px] text-gray-500 block">Cash on delivery</span>
                  </div>

                  {/* Quick Action Card */}
                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 flex flex-col justify-between">
                    <span className="text-xs font-bold text-amber-800">Quick Inventory Action</span>
                    <button
                      onClick={handleOpenAddProduct}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Product</span>
                    </button>
                  </div>

                </div>

                {/* Recent Orders Preview */}
                <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif-luxury font-bold text-base text-gray-900">
                      Recent Customer Orders
                    </h3>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs text-amber-700 hover:underline font-semibold"
                    >
                      View All Orders ({orders.length}) →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-gray-200 text-gray-500 font-semibold bg-gray-50">
                        <tr>
                          <th className="py-2.5 px-3">Order ID</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">City</th>
                          <th className="py-2.5 px-3">Method</th>
                          <th className="py-2.5 px-3">Final Amount</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord.id} className="hover:bg-gray-50">
                            <td className="py-3 px-3 font-mono font-bold text-amber-800">
                              #{ord.id}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-gray-900">{ord.customerName}</div>
                              <div className="text-[11px] text-gray-500">{ord.whatsappNumber}</div>
                            </td>
                            <td className="py-3 px-3 text-gray-600">{ord.city}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.paymentMethod === 'advance'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {ord.paymentMethod === 'advance' ? 'Advance' : 'COD'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-gray-900">
                              Rs. {ord.finalAmount.toLocaleString()}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : ord.status === 'Cancelled'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setViewingOrder(ord)}
                                className="px-2.5 py-1 rounded bg-gray-100 text-gray-800 hover:bg-amber-500 hover:text-white font-semibold text-[11px] transition-colors"
                              >
                                Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: PRODUCT MANAGEMENT */}
            {activeTab === 'products' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Search & Add Product Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products by title or category..."
                      value={productAdminSearch}
                      onChange={(e) => setProductAdminSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    onClick={handleOpenAddProduct}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Picture</th>
                          <th className="py-3 px-4">Product Title (Name)</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Price / Old</th>
                          <th className="py-3 px-4">Sizes</th>
                          <th className="py-3 px-4">Stock</th>
                          <th className="py-3 px-4 text-center">Ticker Banner</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredAdminProducts.map((prod) => (
                          <tr key={prod.id} className="hover:bg-gray-50">
                            
                            {/* Thumbnail */}
                            <td className="py-3 px-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                <img
                                  src={prod.images[0]}
                                  alt={prod.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </td>

                            {/* Product Title (required field clearly visible) */}
                            <td className="py-3 px-4">
                              <div className="font-serif-luxury font-bold text-sm text-gray-900 max-w-xs">
                                {prod.title}
                              </div>
                              <div className="flex gap-1.5 mt-1">
                                {prod.isFeatured && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold">
                                    Featured
                                  </span>
                                )}
                                {prod.isNewArrival && (
                                  <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-bold">
                                    New
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {prod.category}
                            </td>

                            {/* Price */}
                            <td className="py-3 px-4 font-mono font-bold text-gray-900">
                              Rs. {prod.price.toLocaleString()}
                              {prod.oldPrice && (
                                <span className="text-[10px] text-gray-400 line-through block font-normal">
                                  Rs. {prod.oldPrice.toLocaleString()}
                                </span>
                              )}
                            </td>

                            {/* Sizes */}
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[130px]">
                                {prod.sizes.map((s) => (
                                  <span
                                    key={s}
                                    className="px-1.5 py-0.2 rounded bg-gray-100 border border-gray-200 text-[10px] text-gray-700 font-mono"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </td>

                            {/* Stock */}
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prod.stockStatus === 'in_stock'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : prod.stockStatus === 'limited'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {prod.stockStatus === 'in_stock'
                                  ? `In Stock (${prod.stockQuantity})`
                                  : prod.stockStatus === 'limited'
                                  ? `Limited (${prod.stockQuantity})`
                                  : 'Out of Stock'}
                              </span>
                            </td>

                            {/* In Running Banner toggle */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => toggleRunningBannerProduct(prod.id)}
                                className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  prod.inRunningBanner
                                    ? 'bg-amber-500 text-white shadow-2xs'
                                    : 'bg-gray-100 text-gray-500 hover:text-gray-800'
                                }`}
                                title="Toggle in Running Banner"
                              >
                                {prod.inRunningBanner ? 'Ticker ON' : 'Off'}
                              </button>
                            </td>

                            {/* Active toggle */}
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => toggleProductActive(prod.id)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                  prod.isActive
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                              >
                                {prod.isActive ? 'Active' : 'Disabled'}
                              </button>
                            </td>

                            {/* Edit / Delete actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(prod)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 transition-colors"
                                  title="Edit Product Details & Pictures"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${prod.title}"?`)) {
                                      deleteProduct(prod.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white text-red-500 transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                
                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by customer, phone, order ID..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs text-gray-500">Status:</span>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                    >
                      <option value="all">All Statuses ({orders.length})</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Order ID</th>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Customer Details</th>
                          <th className="py-3 px-4">City</th>
                          <th className="py-3 px-4">Items</th>
                          <th className="py-3 px-4">Method & Screenshot</th>
                          <th className="py-3 px-4">Final Amount</th>
                          <th className="py-3 px-4">MNP Courier & Tracking</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-gray-50">
                            
                            {/* Order ID */}
                            <td className="py-3 px-4 font-mono font-bold text-amber-800">
                              #{ord.id}
                            </td>

                            {/* Date */}
                            <td className="py-3 px-4 text-gray-500 text-[11px]">
                              {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </td>

                            {/* Customer */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-gray-900">{ord.customerName}</div>
                              <div className="text-[11px] text-gray-500 flex items-center gap-1">
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                {ord.whatsappNumber}
                              </div>
                            </td>

                            {/* City */}
                            <td className="py-3 px-4 text-gray-700 font-medium">
                              {ord.city}
                            </td>

                            {/* Items count */}
                            <td className="py-3 px-4">
                              <div className="text-gray-900 font-medium">
                                {ord.items.length} {ord.items.length === 1 ? 'pair' : 'pairs'}
                              </div>
                              <div className="text-[10px] text-gray-500 line-clamp-1 max-w-[120px]">
                                {ord.items.map((i) => i.product.title).join(', ')}
                              </div>
                            </td>

                            {/* Payment Method & Screenshot */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ord.paymentMethod === 'advance'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}>
                                  {ord.paymentMethod === 'advance' ? 'Advance (5% OFF)' : 'COD'}
                                </span>

                                {ord.paymentScreenshot && (
                                  <button
                                    onClick={() => setViewingScreenshot(ord.paymentScreenshot!)}
                                    className="p-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-500 hover:text-white transition-colors"
                                    title="View Payment Screenshot"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {/* Final Amount */}
                            <td className="py-3 px-4 font-mono font-extrabold text-gray-900">
                              Rs. {ord.finalAmount.toLocaleString()}
                              {ord.discount > 0 && (
                                <span className="text-[9px] text-emerald-700 block font-normal">
                                  Saved Rs. {ord.discount}
                                </span>
                              )}
                            </td>

                            {/* MNP Courier & Tracking */}
                            <td className="py-3 px-4">
                              {ord.trackingNumber ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono font-extrabold text-[11px] text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300">
                                      {ord.trackingNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(ord.trackingNumber!);
                                      }}
                                      className="p-0.5 rounded text-gray-400 hover:text-amber-800"
                                      title="Copy Consignment No."
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                                    <span className="font-semibold text-gray-700">MNP Courier</span>
                                    <span>•</span>
                                    <a
                                      href="https://track.mulphilog.com"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-amber-700 hover:underline flex items-center gap-0.5 font-bold"
                                    >
                                      <span>Track</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setBookingOrder(ord)}
                                  className="py-1 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Prepare MNP Courier Booking"
                                >
                                  <Truck className="w-3 h-3 text-amber-700" />
                                  <span>Book MNP</span>
                                </button>
                              )}
                            </td>

                            {/* Status dropdown */}
                            <td className="py-3 px-4">
                              <select
                                value={ord.status}
                                onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                                className={`text-[10px] font-bold rounded-lg px-2 py-1 bg-gray-50 border border-gray-300 focus:outline-none ${
                                  ord.status === 'Delivered'
                                    ? 'text-emerald-700'
                                    : ord.status === 'Cancelled'
                                    ? 'text-red-600'
                                    : 'text-amber-800'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            {/* Action Buttons */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                
                                {/* MNP Courier Booking Shortcut */}
                                <button
                                  onClick={() => setBookingOrder(ord)}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 transition-colors border border-amber-200 cursor-pointer"
                                  title={ord.trackingNumber ? `Manage MNP Consignment (${ord.trackingNumber})` : "Prepare MNP Shipment Booking"}
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                </button>
                                
                                {/* Direct WhatsApp message to customer */}
                                <a
                                  href={getCustomerStatusWhatsAppUrl(
                                    ord,
                                    `Your order of Rs. ${ord.finalAmount.toLocaleString()} is currently marked as *${ord.status}*. We are preparing your handcrafted footwear.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-200"
                                  title="Message Customer on WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                </a>

                                {/* View full order */}
                                <button
                                  onClick={() => setViewingOrder(ord)}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 transition-colors"
                                  title="View Full Order Invoice"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete order */}
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete Order #${ord.id}?`)) {
                                      deleteOrder(ord.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white text-red-500 transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: BANNER MANAGEMENT */}
            {activeTab === 'banners' && (
              <div className="max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="font-serif-luxury font-bold text-lg text-gray-900">
                    Homepage Banner Settings
                  </h3>
                  <p className="text-xs text-gray-500">
                    Update the main hero banner text, upload custom image, and toggle the continuous running ticker banner.
                  </p>
                </div>

                {bannerSavedMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Banner settings successfully saved!</span>
                  </div>
                )}

                <form onSubmit={handleSaveBanner} className="space-y-4 text-xs sm:text-sm">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Hero Banner Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Hero Banner Subtitle
                    </label>
                    <input
                      type="text"
                      required
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Banner Image Preview & Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 block">
                      Banner Image
                    </label>
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 h-48">
                      <img
                        src={bannerImage}
                        alt="Hero Banner Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors border border-gray-300">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>Upload New Banner Image (JPG, PNG, WEBP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Running Banner Toggle */}
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">Enable Running Product Marquee</h4>
                      <p className="text-[11px] text-gray-500">
                        Shows the continuous product ticker on the homepage.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={enableRunningBanner}
                      onChange={(e) => setEnableRunningBanner(e.target.checked)}
                      className="w-5 h-5 accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-transform hover:scale-[1.01]"
                  >
                    Save Banner Changes
                  </button>
                </form>
              </div>
            )}

            {/* TAB 5: CATEGORIES MANAGEMENT */}
            {activeTab === 'categories' && (
              <div className="max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h3 className="font-serif-luxury font-bold text-lg text-gray-900">
                    Category Management
                  </h3>
                  <p className="text-xs text-gray-500">
                    Create new collections and remove unused categories.
                  </p>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Peshawari Chappal Special, Bridal Khussa"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </form>

                {/* Categories List */}
                <div className="space-y-2 pt-2">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-gray-800">{cat}</span>
                      {cat !== 'All Products' && (
                        <button
                          onClick={() => {
                            if (confirm(`Remove category "${cat}"?`)) {
                              deleteCategory(cat);
                            }
                          }}
                          className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: MNP COURIER INTEGRATION */}
            {activeTab === 'courier' && (
              <div className="animate-in fade-in duration-200">
                <MNPCourierIntegration />
              </div>
            )}

            {/* TAB 7: ADMIN SETTINGS / SECURITY */}
            {activeTab === 'security' && (
              <div className="animate-in fade-in duration-200">
                <AdminSecuritySettings onLogout={logoutAdmin} />
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL: PRODUCT ADD / EDIT FORM (Fixed & Enhanced according to requirement) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div 
            className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-luxury font-bold text-lg text-gray-900">
                    {editingProduct ? 'Edit Product Details' : 'Add New Handcrafted Product'}
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    All required fields are clearly organized below
                  </span>
                </div>
              </div>

              <button
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs sm:text-sm">
              
              {formError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}

              {/* 1. PRODUCT TITLE / NAME (REQUIRED & CLEARLY VISIBLE AT TOP) */}
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                    Product Title / Product Name <span className="text-red-600">* (Required)</span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    Appears directly on store cards & details
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Golden Zarri Peshawari Chappal"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none font-semibold shadow-2xs"
                />
              </div>

              {/* 2. PRODUCT IMAGE UPLOAD (REQUIRED WITH INSTANT PREVIEW & REPLACE) */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-extrabold text-gray-900 uppercase tracking-wider block">
                      Product Image Upload <span className="text-red-600">* (Required)</span>
                    </label>
                    <span className="text-[11px] text-gray-500">
                      JPG, JPEG, PNG, or WEBP supported. Preview shown immediately below.
                    </span>
                  </div>

                  <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-102">
                    <Upload className="w-4 h-4" />
                    <span>Upload Product Image</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Instant Image Previews & Replacement */}
                {formImages.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-gray-700 block">
                      Uploaded Image Preview ({formImages.length}):
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {formImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative w-24 h-24 rounded-xl overflow-hidden bg-white border-2 border-gray-300 group shadow-xs"
                        >
                          <img src={img} alt="Product Preview" className="w-full h-full object-cover" />
                          
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-amber-500 text-white text-[9px] font-bold text-center py-0.5 shadow-xs">
                              Main Photo
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveFormImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-red-600 text-white opacity-90 hover:opacity-100 shadow-md"
                            title="Delete Picture"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Replace Primary Photo shortcut if editing */}
                      <label className="cursor-pointer w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-500 flex flex-col items-center justify-center p-2 text-center text-[10px] text-gray-500 hover:text-amber-700 bg-white transition-colors">
                        <RotateCcw className="w-4 h-4 mb-1 text-amber-600" />
                        <span>Replace Primary</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/jpg"
                          onChange={handleReplacePrimaryImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 text-center text-xs text-gray-500 bg-white">
                    No image uploaded yet. Click <strong>"Upload Product Image"</strong> to choose your product photo.
                  </div>
                )}
              </div>

              {/* 3. PRODUCT PRICE & OLD PRICE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Product Price (PKR) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 3450"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Old Price (PKR) (Optional for Discount Tag)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 4200"
                    value={formOldPrice || ''}
                    onChange={(e) =>
                      setFormOldPrice(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. PRODUCT SIZES */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Sizes (Comma separated) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7, 8, 9, 10, 11, 12"
                  value={formSizes}
                  onChange={(e) => setFormSizes(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none font-mono"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Example: 6, 7, 8, 9, 10, 11 (Men's) or 36, 37, 38, 39, 40 (Women's)
                </span>
              </div>

              {/* 5. PRODUCT CATEGORY & STOCK STATUS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Product Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none font-medium"
                  >
                    {categories
                      .filter((c) => c !== 'All Products')
                      .map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Stock Status & Quantity
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={formStockStatus}
                      onChange={(e) => setFormStockStatus(e.target.value as any)}
                      className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-xs focus:outline-none"
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="limited">Limited</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>

                    <input
                      type="number"
                      min={0}
                      value={formStockQuantity}
                      onChange={(e) => setFormStockQuantity(Number(e.target.value))}
                      className="bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 font-mono text-xs focus:outline-none"
                      title="Available stock count"
                    />
                  </div>
                </div>
              </div>

              {/* 6. PRODUCT DESCRIPTION */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Product Description <span className="text-gray-400 font-normal">(Craftsmanship, leather type, inner padding)</span>
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none resize-none"
                  placeholder="Describe material, handcrafting technique, sole type, occasion suitability..."
                />
              </div>

              {/* Visibility & Marketing Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsNewArrival}
                    onChange={(e) => setFormIsNewArrival(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formInRunningBanner}
                    onChange={(e) => setFormInRunningBanner(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Ticker Marquee</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="accent-amber-500"
                  />
                  <span>Active (Visible)</span>
                </label>
              </div>

              {/* Submit Product */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-extrabold text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save & Update Product' : 'Add Product to Store'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: ORDER DETAILS INVOICE */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div 
            className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <span className="text-xs text-amber-700 font-mono font-bold">ORDER #{viewingOrder.id}</span>
                <h3 className="font-serif-luxury font-bold text-lg text-gray-900">Order Details</h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-200">
                <div>
                  <span className="text-gray-500 block text-xs">Customer Name:</span>
                  <span className="font-bold text-gray-900 text-base">{viewingOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-xs">WhatsApp / Contact:</span>
                  <span className="font-mono text-amber-700 font-bold">{viewingOrder.whatsappNumber}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block text-xs">Delivery Address:</span>
                  <span className="text-gray-800">{viewingOrder.address}, {viewingOrder.city}</span>
                </div>
              </div>

              {/* MNP Courier & Consignment Tracking Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 to-amber-100/40 border border-amber-300 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-700" />
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">
                      MNP Courier Shipment Tracking
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300">
                    Official MNP Courier
                  </span>
                </div>

                {viewingOrder.trackingNumber ? (
                  <div className="p-3 bg-white rounded-xl border border-amber-200/90 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase font-bold block">
                          Consignment / Tracking Number
                        </span>
                        <span className="font-mono text-base font-extrabold text-gray-900">
                          {viewingOrder.trackingNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(viewingOrder.trackingNumber!);
                            setCopiedTracking(true);
                            setTimeout(() => setCopiedTracking(false), 2000);
                          }}
                          className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs flex items-center gap-1 transition-colors"
                          title="Copy tracking number"
                        >
                          {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedTracking ? 'Copied' : 'Copy'}</span>
                        </button>

                        <a
                          href="https://track.mulphilog.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                        >
                          <span>Track on MNP</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          type="button"
                          onClick={() => setBookingOrder(viewingOrder)}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-900 text-xs font-semibold"
                          title="Edit Consignment Details"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {viewingOrder.mnpShipment && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-[11px]">
                        <div>
                          <span className="text-gray-500 block">Service:</span>
                          <span className="font-semibold text-gray-800">{viewingOrder.mnpShipment.serviceType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Origin:</span>
                          <span className="font-semibold text-gray-800">{viewingOrder.mnpShipment.originCity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">Weight:</span>
                          <span className="font-semibold text-gray-800">{viewingOrder.mnpShipment.weightKg} KG</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block">COD Collect:</span>
                          <span className="font-mono font-bold text-amber-800">
                            {viewingOrder.mnpShipment.codAmount > 0 ? `Rs. ${viewingOrder.mnpShipment.codAmount.toLocaleString()}` : 'Rs. 0 (Advance Paid)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-amber-200">
                    <div>
                      <span className="text-xs font-bold text-gray-800 block">
                        No MNP tracking number assigned yet
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Prepare booking to assign MNP consignment and notify customer.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingOrder(viewingOrder)}
                      className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Prepare MNP Booking</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-600 uppercase">Items Ordered:</span>
                {viewingOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.images[0]}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{item.product.title}</div>
                        <div className="text-gray-500 text-xs">Size: {item.selectedSize} • Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-gray-900">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Financials */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>Rs. {viewingOrder.subtotal.toLocaleString()}</span>
                </div>
                {viewingOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>5% Advance Discount:</span>
                    <span>- Rs. {viewingOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-2 border-t border-gray-200">
                  <span>Final Total:</span>
                  <span className="text-amber-700">Rs. {viewingOrder.finalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Screenshot if available */}
              {viewingOrder.paymentScreenshot && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-800 uppercase">Attached Payment Screenshot:</span>
                  <div 
                    onClick={() => setViewingScreenshot(viewingOrder.paymentScreenshot!)}
                    className="cursor-pointer max-w-xs rounded-xl overflow-hidden border border-amber-300 hover:opacity-90 shadow-sm"
                  >
                    <img
                      src={viewingOrder.paymentScreenshot}
                      alt="Payment proof"
                      className="w-full h-44 object-cover"
                    />
                    <span className="block text-center bg-amber-100 text-amber-900 text-[10px] py-1 font-bold">
                      Click to Enlarge Screenshot
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HIGH RESOLUTION SCREENSHOT LIGHTBOX */}
      {viewingScreenshot && (
        <div 
          onClick={() => setViewingScreenshot(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-in fade-in cursor-zoom-out"
        >
          <button
            onClick={() => setViewingScreenshot(null)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white text-gray-900 font-bold shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={viewingScreenshot}
            alt="Payment Screenshot Full Size"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border border-gray-200"
          />
        </div>
      )}

      {/* MODAL: MNP SHIPMENT BOOKING */}
      <MNPShipmentModal
        order={bookingOrder}
        mnpConfig={mnpConfig}
        isOpen={Boolean(bookingOrder)}
        onClose={() => setBookingOrder(null)}
        onConfirmBooking={(orderId, booking) => {
          prepareMNPShipmentBooking(orderId, booking);
          if (viewingOrder && viewingOrder.id === orderId) {
            setViewingOrder((prev) => prev ? {
              ...prev,
              trackingNumber: booking.consignmentNumber,
              courierName: 'MNP Courier',
              status: 'Shipped',
              mnpShipment: booking,
            } : null);
          }
        }}
      />

    </div>
  );
};
