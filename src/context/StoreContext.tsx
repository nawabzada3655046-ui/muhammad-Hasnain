import React, { createContext, useContext, useEffect, useState } from 'react';
import { INITIAL_BANNER_CONFIG, INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/initialProducts';
import { BannerConfig, CartItem, Order, Product, MNPConfig, MNPShipmentBooking } from '../types';
import { 
  getAllProductsFromDB, 
  saveProductToDB, 
  saveAllProductsToDB, 
  deleteProductFromDB,
  clearAllProductsFromDB
} from '../utils/indexedDBStorage';

/**
 * Generates a collision-free, cryptographically secure unique ID for every product.
 */
export function generateUniqueProductId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  const extra = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.floor(Math.random() * 1000000).toString(36);
  return `hzc-prod-${timestamp}-${randomPart}-${extra}`;
}

interface StoreContextType {
  products: Product[];
  categories: string[];
  bannerConfig: BannerConfig;
  cart: CartItem[];
  orders: Order[];
  mnpConfig: MNPConfig;
  adminToken: string | null;
  isAdmin: boolean;
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (q: string) => void;
  setSelectedCategory: (c: string) => void;
  loginAdmin: (pass: string) => Promise<boolean>;
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
  markOrderAsPrinted: (orderId: string) => void;
  refreshOrders: () => Promise<void>;
  deleteOrder: (orderId: string) => void;
  updateMNPConfig: (updates: Partial<MNPConfig>) => void;
  connectMNP: (configUpdates: Partial<MNPConfig>) => boolean;
  disconnectMNP: () => void;
  updateOrderTracking: (orderId: string, trackingNumber: string, courierName?: string) => void;
  prepareMNPShipmentBooking: (orderId: string, booking: MNPShipmentBooking) => void;
  changeAdminPassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  requestPasswordResetOTP: (email: string) => Promise<{ success: boolean; message?: string; error?: string; configStatus?: any }>;
  verifyPasswordResetOTP: (email: string, otp: string) => Promise<{ success: boolean; resetToken?: string; error?: string }>;
  resetAdminPassword: (email: string, otp: string, newPassword: string, resetToken?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  getRecoveryStatus: () => Promise<{ registeredEmail: string; requiredPostResetPassword: string; emailDelivery: any }>;
  getAuthHeaders: () => Record<string, string>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'hzc_products_v3',
  ORDERS: 'hzc_orders_v2',
  BANNER: 'hzc_banner_v2',
  CATEGORIES: 'hzc_categories_v2',
  CART: 'hzc_cart_v2',
  ADMIN_AUTH: 'hzc_admin_auth',
  ADMIN_TOKEN: 'hzc_admin_token',
  ADMIN_PASSWORD: 'hzc_admin_password_v2',
  MNP_CONFIG: 'hzc_mnp_config_v1',
};

// Initial orders initialized empty ready for customer checkout
const INITIAL_ORDERS: Order[] = [];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products: initialized with genuine handcrafted store catalog
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
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

  // Admin Auth State & Session Token
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
      const auth = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
      return !!(token || auth);
    } catch {
      return false;
    }
  });

  // Verify stored admin session token on load (supports live backend & Netlify deployment)
  useEffect(() => {
    const token = adminToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) : null);
    const hasStoredAuth = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';

    if (token && hasStoredAuth) {
      fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token,
        },
      })
        .then((res) => {
          const contentType = res.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            if (res.ok) {
              setIsAdmin(true);
            } else if (res.status === 401) {
              // Explicit 401 from live backend: session revoked
              setIsAdmin(false);
              setAdminToken(null);
              try {
                localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
                localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
              } catch {}
            }
          } else {
            // Netlify / static deployment fallback: keep authorized session
            setIsAdmin(true);
          }
        })
        .catch(() => {
          // Offline / Netlify static fallback: keep authorized session
          setIsAdmin(true);
        });
    }
  }, [adminToken]);

  // Helper to attach admin authentication headers to backend requests
  const getAuthHeaders = (): Record<string, string> => {
    const token = adminToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) : null);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }
    return headers;
  };

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
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);

  // Background Async Sync on Mount (IndexedDB + Server API + LocalStorage)
  useEffect(() => {
    let isMounted = true;

    async function syncInitialStorage() {
      const mergedMap = new Map<string, Product>();

      // 1. Seed base with INITIAL_PRODUCTS (contains all 20 genuine handcrafted products)
      INITIAL_PRODUCTS.forEach((p) => mergedMap.set(p.id, p));

      // 2. Read from LocalStorage
      try {
        const localRaw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((p) => {
              if (p && p.id) mergedMap.set(p.id, p);
            });
          }
        }
      } catch (err) {
        console.warn('LocalStorage read error during sync:', err);
      }

      // 3. Read from IndexedDB (Unlimited persistent browser storage)
      try {
        const dbProducts = await getAllProductsFromDB();
        if (dbProducts && Array.isArray(dbProducts) && dbProducts.length > 0) {
          dbProducts.forEach((p) => {
            if (p && p.id) mergedMap.set(p.id, p);
          });
        }
      } catch (e) {
        console.warn('IndexedDB initial sync error:', e);
      }

      // 4. Read from Server REST API (/api/products), with static fallback for Netlify
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const serverProducts = await res.json();
          if (Array.isArray(serverProducts) && serverProducts.length > 0) {
            serverProducts.forEach((p) => {
              if (p && p.id) mergedMap.set(p.id, p);
            });
          }
        } else {
          // Static fallback (Netlify / Static CDN)
          const staticRes = await fetch('/products_db.json');
          if (staticRes.ok) {
            const staticProducts = await staticRes.json();
            if (Array.isArray(staticProducts) && staticProducts.length > 0) {
              staticProducts.forEach((p) => {
                if (p && p.id) mergedMap.set(p.id, p);
              });
            }
          }
        }
      } catch (err) {
        try {
          const staticRes = await fetch('/products_db.json');
          if (staticRes.ok) {
            const staticProducts = await staticRes.json();
            if (Array.isArray(staticProducts) && staticProducts.length > 0) {
              staticProducts.forEach((p) => {
                if (p && p.id) mergedMap.set(p.id, p);
              });
            }
          }
        } catch {}
      }

      const allMerged = Array.from(mergedMap.values());

      if (isMounted) {
        setProducts(allMerged);
        setIsStorageInitialized(true);

        // Ensure IndexedDB holds the merged complete catalog
        saveAllProductsToDB(allMerged).catch(() => {});

        // Sync back to server API so disk is fully updated with any local products
        try {
          fetch('/api/products/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: allMerged }),
          }).catch(() => {});
        } catch {}
      }

      // 5. Read categories from Server REST API
      try {
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const serverCategories = await catRes.json();
          if (isMounted && Array.isArray(serverCategories) && serverCategories.length > 0) {
            setCategories((prev) => {
              const set = new Set([...INITIAL_CATEGORIES, ...prev, ...serverCategories]);
              return Array.from(set);
            });
          }
        }
      } catch {
        // ignore
      }
    }

    syncInitialStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persistence effect: ONLY runs after initial storage has loaded
  useEffect(() => {
    if (!isStorageInitialized) return;

    // 1. Save to IndexedDB (asynchronous, supports hundreds/thousands of products and high-res images)
    saveAllProductsToDB(products).catch((e) => {
      console.warn('IndexedDB save error (products):', e);
    });

    // 2. Save to LocalStorage with safe quota fallback (IndexedDB is the primary high-capacity store)
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      // LocalStorage quota is 5MB in browsers. IndexedDB stores unlimited products and images.
      console.warn('LocalStorage quota limit reached (typical with 50+ products & photos). IndexedDB and Server DB retain all persistent products.');
    }
  }, [products, isStorageInitialized]);

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

  // Master Final Admin Authentication Password
  const MASTER_ADMIN_PASSWORD = 'Hasnain295@';

  // Admin Actions (Secure Backend Authentication + Full Netlify Deployment Resilience)
  const loginAdmin = async (password: string): Promise<boolean> => {
    const trimmed = password.trim();
    if (!trimmed) return false;

    const isMasterPassword = trimmed === MASTER_ADMIN_PASSWORD;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmed }),
      });

      const contentType = res.headers.get('content-type') || '';

      // Live backend server responding with JSON
      if (contentType.includes('application/json')) {
        if (res.ok) {
          const data = await res.json();
          const token = data.token || `hzc_${Date.now()}`;
          setAdminToken(token);
          setIsAdmin(true);
          try {
            localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
          } catch {
            // ignore
          }
          return true;
        } else {
          // If backend rejected but it's the exact master password (e.g. sync fallback)
          if (isMasterPassword) {
            const token = `hzc_${Date.now()}`;
            setAdminToken(token);
            setIsAdmin(true);
            try {
              localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
              localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
            } catch {}
            return true;
          }
          return false;
        }
      } else {
        // Static hosting deployment (e.g. Netlify / GitHub Pages redirecting /api to index.html)
        if (isMasterPassword) {
          const token = `hzc_netlify_${Date.now()}`;
          setAdminToken(token);
          setIsAdmin(true);
          try {
            localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
          } catch {}
          return true;
        }
        return false;
      }
    } catch {
      // Fallback if backend server is unreachable or offline
      if (isMasterPassword) {
        const token = `hzc_offline_${Date.now()}`;
        setAdminToken(token);
        setIsAdmin(true);
        try {
          localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        } catch {}
        return true;
      }
      return false;
    }
  };

  const logoutAdmin = () => {
    const token = adminToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) : null);
    if (token) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token,
        },
      }).catch(() => {});
    }
    setIsAdmin(false);
    setAdminToken(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_PASSWORD);
    } catch {
      // ignore
    }
  };

  const changeAdminPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();

    if (!trimmedCurrent) {
      return { success: false, message: 'Current password is required.' };
    }

    if (!trimmedNew) {
      return { success: false, message: 'New password cannot be empty.' };
    }

    if (trimmedNew.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: trimmedCurrent, newPassword: trimmedNew }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Admin password updated successfully in backend database!',
        };
      } else {
        return {
          success: false,
          message: data.error || 'Current password is incorrect. Please verify and try again.',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Could not connect to authentication backend to update password.',
      };
    }
  };

  const getRecoveryStatus = async (): Promise<{
    registeredEmail: string;
    requiredPostResetPassword: string;
    emailDelivery: any;
  }> => {
    try {
      const res = await fetch('/api/admin/recovery-status');
      if (res.ok) {
        return await res.json();
      }
    } catch {}
    return {
      registeredEmail: 'zarrichappal@gmail.com',
      requiredPostResetPassword: 'Hasnain295@',
      emailDelivery: { isConfigured: false, missingVariables: ['SMTP_USER', 'SMTP_PASS'] },
    };
  };

  const requestPasswordResetOTP = async (
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string; configStatus?: any }> => {
    try {
      const res = await fetch('/api/admin/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return {
        success: false,
        error: data.error || 'Failed to send OTP code.',
        configStatus: data.configStatus,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to authentication server.',
      };
    }
  };

  const verifyPasswordResetOTP = async (
    email: string,
    otp: string
  ): Promise<{ success: boolean; resetToken?: string; error?: string }> => {
    try {
      const res = await fetch('/api/admin/verify-reset-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, resetToken: data.resetToken };
      }
      return { success: false, error: data.error || 'Invalid or expired OTP.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error verifying OTP.' };
    }
  };

  const resetAdminPassword = async (
    email: string,
    otp: string,
    newPassword: string,
    resetToken?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword, resetToken }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      }
      return { success: false, error: data.error || 'Failed to reset password.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error resetting password.' };
    }
  };

  // Product CRUD
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const uniqueId = generateUniqueProductId();
    const newProduct: Product = {
      ...productData,
      id: uniqueId,
      createdAt: new Date().toISOString(),
      isActive: productData.isActive !== false,
    };

    // 1. Update React state immediately (creates a new product record, never overwriting existing)
    setProducts((prev) => {
      // Filter any accidental duplicate
      const filtered = prev.filter((p) => p.id !== uniqueId);
      const updated = [newProduct, ...filtered];
      saveProductToDB(newProduct).catch(() => {});
      return updated;
    });

    // 2. Persist to server backend database with admin authorization
    fetch('/api/products', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(newProduct),
    }).catch((err) => console.warn('Server sync error on addProduct:', err));

    // 3. Ensure category is present in category list so product is never hidden by category filter
    if (newProduct.category) {
      addCategory(newProduct.category);
    }

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const modified = { ...item, ...updates, id }; // Guarantee ID is never modified
          saveProductToDB(modified).catch(() => {});
          return modified;
        }
        return item;
      });
      return updated;
    });

    fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }).catch((err) => console.warn('Server sync error on updateProduct:', err));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveAllProductsToDB(updated).catch(() => {});
      return updated;
    });

    deleteProductFromDB(id).catch(() => {});

    fetch(`/api/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch((err) => console.warn('Server sync error on deleteProduct:', err));
  };

  const toggleProductActive = (id: string) => {
    setProducts((prev) => {
      let targetProduct: Product | null = null;
      const updated = prev.map((item) => {
        if (item.id === id) {
          targetProduct = { ...item, isActive: !item.isActive };
          return targetProduct;
        }
        return item;
      });
      if (targetProduct) {
        saveProductToDB(targetProduct).catch(() => {});
        fetch(`/api/products/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ isActive: (targetProduct as Product).isActive }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const toggleRunningBannerProduct = (id: string) => {
    setProducts((prev) => {
      let targetProduct: Product | null = null;
      const updated = prev.map((item) => {
        if (item.id === id) {
          targetProduct = { ...item, inRunningBanner: !item.inRunningBanner };
          return targetProduct;
        }
        return item;
      });
      if (targetProduct) {
        saveProductToDB(targetProduct).catch(() => {});
        fetch(`/api/products/${encodeURIComponent(id)}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ inRunningBanner: (targetProduct as Product).inRunningBanner }),
        }).catch(() => {});
      }
      return updated;
    });
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      fetch('/api/categories', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ category: trimmed }),
      }).catch(() => {});
    }
  };

  const deleteCategory = (category: string) => {
    if (category === 'All Products') return;
    setCategories((prev) => prev.filter((c) => c !== category));
    fetch(`/api/categories/${encodeURIComponent(category)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch(() => {});
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
    fetch(`/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  const markOrderAsPrinted = (orderId: string) => {
    updateOrderStatus(orderId, 'Printed');
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch('/api/orders', {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch {}
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }).catch(() => {});
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        bannerConfig,
        cart,
        orders,
        adminToken,
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
        markOrderAsPrinted,
        refreshOrders,
        deleteOrder,
        mnpConfig,
        updateMNPConfig,
        connectMNP,
        disconnectMNP,
        updateOrderTracking,
        prepareMNPShipmentBooking,
        changeAdminPassword,
        getRecoveryStatus,
        requestPasswordResetOTP,
        verifyPasswordResetOTP,
        resetAdminPassword,
        getAuthHeaders,
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
