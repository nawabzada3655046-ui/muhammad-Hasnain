import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_BANNER_CONFIG, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initialProducts';
import { BannerConfig, CartItem, Order, Product, MNPConfig, MNPShipmentBooking } from '../types';

interface StoreContextType {
  products: Product[];
  categories: string[];
  bannerConfig: BannerConfig;
  cart: CartItem[];
  orders: Order[];
  mnpConfig: MNPConfig;
  isAdmin: boolean;
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  loginAdmin: (pass: string) => boolean;
  logoutAdmin: () => void;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductActive: (id: string) => void;
  toggleRunningBannerProduct: (id: string) => void;
  addCategory: (cat: string) => void;
  deleteCategory: (cat: string) => void;
  updateBannerConfig: (updates: Partial<BannerConfig>) => void;
  addToCart: (product: Product, size: string | number, quantity?: number) => void;
  removeFromCart: (productId: string, size: string | number) => void;
  updateCartQuantity: (productId: string, size: string | number, quantity: number) => void;
  clearCart: () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  deleteOrder: (orderId: string) => void;
  updateMNPConfig: (updates: Partial<MNPConfig>) => void;
  connectMNP: (configUpdates: Partial<MNPConfig>) => boolean;
  disconnectMNP: () => void;
  updateOrderTracking: (orderId: string, trackingNumber: string, courierName?: string) => void;
  prepareMNPShipmentBooking: (orderId: string, booking: MNPShipmentBooking) => void;
  changeAdminPassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'hzc_products_v2',
  ORDERS: 'hzc_orders_v2',
  BANNER: 'hzc_banner_v2',
  CATEGORIES: 'hzc_categories_v2',
  CART: 'hzc_cart_v2',
  ADMIN_AUTH: 'hzc_admin_auth',
  ADMIN_PASSWORD: 'hzc_admin_password_v2',
  MNP_CONFIG: 'hzc_mnp_config_v1',
};

// Seed an initial demo order so admin dashboard has realistic data out of the box
const INITIAL_ORDERS: Order[] = [
  {
    id: 'HZC-1082',
    customerName: 'Muhammad Bilal Khan',
    contactNumber: '03001234567',
    whatsappNumber: '03001234567',
    address: 'House # 42, Street 8, Sector F-8/2',
    city: 'Islamabad',
    postalCode: '44000',
    specialInstructions: 'Please deliver after 2 PM. Ring bell twice.',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        selectedSize: 9,
        quantity: 1,
      },
    ],
    paymentMethod: 'advance',
    subtotal: 3450,
    discount: 172.5,
    shippingFee: 0,
    finalAmount: 3277.5,
    paymentScreenshot: INITIAL_PRODUCTS[0].images[0],
    status: 'Pending',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'HZC-1081',
    customerName: 'Usman Tariq',
    contactNumber: '03219876543',
    whatsappNumber: '03219876543',
    address: 'Flat 304, Al-Madina Heights, Gulberg III',
    city: 'Lahore',
    postalCode: '54000',
    specialInstructions: 'Call before delivery.',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        selectedSize: 8,
        quantity: 1,
      },
    ],
    paymentMethod: 'cod',
    subtotal: 2850,
    discount: 0,
    shippingFee: 0,
    finalAmount: 2850,
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  // Banner Config
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNER);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_BANNER_CONFIG;
  });

  // Categories
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CATEGORIES;
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ORDERS;
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  // Admin Auth
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const DEFAULT_ADMIN_PASSWORDS = ['admin123', '03432782295', 'hasnain786'];

  const [customAdminPassword, setCustomAdminPassword] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD);
    } catch {
      return null;
    }
  });

  // MNP Courier Configuration
  const DEFAULT_MNP_CONFIG: MNPConfig = {
    isConnected: false,
    accountNumber: '',
    username: '',
    password: '',
    apiKey: '',
    originCity: 'Liaqatpur',
    defaultServiceType: 'Overnight',
    environment: 'production',
    autoAssignTracking: true,
  };

  const [mnpConfig, setMnpConfig] = useState<MNPConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MNP_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_MNP_CONFIG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MNP_CONFIG, JSON.stringify(mnpConfig));
  }, [mnpConfig]);

  const updateMNPConfig = (updates: Partial<MNPConfig>) => {
    setMnpConfig((prev) => ({ ...prev, ...updates }));
  };

  const connectMNP = (configUpdates: Partial<MNPConfig>) => {
    setMnpConfig((prev) => ({
      ...prev,
      ...configUpdates,
      isConnected: true,
      lastConnectedAt: new Date().toISOString(),
    }));
    return true;
  };

  const disconnectMNP = () => {
    setMnpConfig((prev) => ({
      ...prev,
      isConnected: false,
    }));
  };

  const updateOrderTracking = (orderId: string, trackingNumber: string, courierName = 'MNP Courier') => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              trackingNumber: trackingNumber.trim(),
              courierName,
              status: o.status === 'Pending' ? 'Confirmed' : o.status,
            }
          : o
      )
    );
  };

  const prepareMNPShipmentBooking = (orderId: string, booking: MNPShipmentBooking) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              trackingNumber: booking.consignmentNumber,
              courierName: 'MNP Courier',
              status: 'Shipped',
              mnpShipment: booking,
            }
          : o
      )
    );
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('LocalStorage save error (products):', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage save error (orders):', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(bannerConfig));
    } catch (e) {
      console.warn('LocalStorage save error (banner):', e);
    }
  }, [bannerConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.warn('LocalStorage save error (categories):', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
      console.warn('LocalStorage save error (cart):', e);
    }
  }, [cart]);

  // Admin Actions
  const loginAdmin = (password: string): boolean => {
    const trimmed = password.trim();
    if (!trimmed) return false;

    // Check against active password (custom changed password or initial defaults)
    let isMatch = false;
    if (customAdminPassword) {
      isMatch = trimmed === customAdminPassword;
    } else {
      isMatch = DEFAULT_ADMIN_PASSWORDS.includes(trimmed);
    }

    if (isMatch) {
      setIsAdmin(true);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch {
      // ignore
    }
  };

  const changeAdminPassword = (
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    if (!trimmedCurrent) {
      return { success: false, message: 'Current password is required.' };
    }

    if (!trimmedNew) {
      return { success: false, message: 'New password cannot be empty.' };
    }

    if (trimmedNew.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    // Verify current password against active password
    let isCurrentValid = false;
    if (customAdminPassword) {
      isCurrentValid = trimmedCurrent === customAdminPassword;
    } else {
      isCurrentValid = DEFAULT_ADMIN_PASSWORDS.includes(trimmedCurrent);
    }

    if (!isCurrentValid) {
      return { success: false, message: 'Current password is incorrect. Please verify and try again.' };
    }

    // Update password
    setCustomAdminPassword(trimmedNew);
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, trimmedNew);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: 'Admin password changed successfully! Your new password will be required for the next admin login.',
    };
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProduct: Product = {
      ...productData,
      id: `hzc-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleProductActive = (id: string) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const toggleRunningBannerProduct = (id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, inRunningBanner: !item.inRunningBanner } : item
      )
    );
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  const deleteCategory = (category: string) => {
    if (category === 'All Products') return;
    setCategories((prev) => prev.filter((c) => c !== category));
  };

  const updateBannerConfig = (updates: Partial<BannerConfig>) => {
    setBannerConfig((prev) => ({ ...prev, ...updates }));
  };

  // Cart Management
  const addToCart = (product: Product, size: string | number, quantity: number = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, selectedSize: size, quantity }];
    });
  };

  const removeFromCart = (productId: string, size: string | number) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const updateCartQuantity = (productId: string, size: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Order Management
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      ...orderData,
      id: `HZC-${randomSuffix}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        bannerConfig,
        cart,
        orders,
        isAdmin,
        searchQuery,
        selectedCategory,
        setSearchQuery,
        setSelectedCategory,
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
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        updateOrderStatus,
        deleteOrder,
        mnpConfig,
        updateMNPConfig,
        connectMNP,
        disconnectMNP,
        updateOrderTracking,
        prepareMNPShipmentBooking,
        changeAdminPassword,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
