import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High payload limits to accommodate high-res product photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const PRODUCTS_FILE = path.join(DATA_DIR, 'products_db.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories_db.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders_db.json');

import {
  verifyAdminMiddleware,
  loginAdminBackend,
  verifyAdminToken,
  changeAdminPasswordBackend,
  revokeAdminToken,
  ensureAdminAuthInitialized,
  ADMIN_RECOVERY_EMAIL,
  REQUIRED_POST_RESET_PASSWORD,
  getEmailDeliveryConfigStatus,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetAdminPasswordWithOTP,
} from './src/server/auth.ts';

// Ensure backend admin authentication credentials are initialized securely
ensureAdminAuthInitialized();

// Helper to safely read JSON file
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.warn(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to safely write JSON file
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// --- REST API ENDPOINTS ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- ADMIN AUTHENTICATION ENDPOINTS (Backend Protected) ---

// POST Admin Login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  const result = loginAdminBackend(password);
  if (!result.success) {
    return res.status(401).json({ error: result.error || 'Invalid admin password' });
  }
  return res.json({ success: true, token: result.token, message: 'Admin authentication successful' });
});

// GET Admin Verify Token
app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  const token = typeof authHeader === 'string' ? authHeader : '';
  if (verifyAdminToken(token)) {
    return res.json({ authenticated: true });
  }
  return res.status(401).json({ authenticated: false, error: 'Unauthorized: Invalid or expired admin session' });
});

// POST Admin Logout
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  const token = typeof authHeader === 'string' ? authHeader : '';
  revokeAdminToken(token);
  return res.json({ success: true, message: 'Logged out successfully' });
});

// POST Admin Change Password
app.post('/api/admin/change-password', verifyAdminMiddleware, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const result = changeAdminPasswordBackend(currentPassword, newPassword);
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'Failed to update admin password' });
  }
  return res.json({ success: true, message: result.message });
});

// GET Admin Password Recovery Status & Email Delivery Service Configuration
app.get('/api/admin/recovery-status', (req, res) => {
  const config = getEmailDeliveryConfigStatus();
  return res.json({
    registeredEmail: ADMIN_RECOVERY_EMAIL,
    requiredPostResetPassword: REQUIRED_POST_RESET_PASSWORD,
    emailDelivery: config,
  });
});

// POST Request 6-digit OTP to zarrichappal@gmail.com
app.post('/api/admin/request-password-reset', async (req, res) => {
  const { email } = req.body || {};
  const result = await requestPasswordResetOTP(email);
  if (!result.success) {
    // If delivery service isn't configured, return 503 Service Unavailable with setup instructions
    const statusCode = result.configStatus && !result.configStatus.isConfigured ? 503 : 400;
    return res.status(statusCode).json({
      success: false,
      error: result.error,
      configStatus: result.configStatus,
    });
  }
  return res.json({ success: true, message: result.message });
});

// POST Verify 6-digit OTP
app.post('/api/admin/verify-reset-otp', (req, res) => {
  const { email, otp } = req.body || {};
  const result = verifyPasswordResetOTP(email, otp);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }
  return res.json({ success: true, resetToken: result.resetToken });
});

// POST Reset Password with Verified OTP
app.post('/api/admin/reset-password', (req, res) => {
  const { email, otp, newPassword, resetToken } = req.body || {};
  const result = resetAdminPasswordWithOTP(email, otp, newPassword, resetToken);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }
  return res.json({ success: true, message: result.message });
});

// GET all products (Public catalog)
app.get('/api/products', (req, res) => {
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  res.json(products);
});

// POST add a new product (Admin Only)
app.post('/api/products', verifyAdminMiddleware, (req, res) => {
  const productData = req.body;
  if (!productData || !productData.title) {
    return res.status(400).json({ error: 'Product title is required' });
  }

  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);

  // Ensure a truly unique, collision-free ID
  const uniqueId = productData.id && !products.some((p) => p.id === productData.id)
    ? productData.id
    : `hzc-prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const newProduct = {
    ...productData,
    id: uniqueId,
    createdAt: productData.createdAt || new Date().toISOString(),
    isActive: productData.isActive !== false,
  };

  // Add new product at top
  const updatedProducts = [newProduct, ...products];
  writeJsonFile(PRODUCTS_FILE, updatedProducts);

  res.status(201).json(newProduct);
});

// PUT update an existing product (Admin Only)
app.put('/api/products/:id', verifyAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);

  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    // If not in DB yet, create it
    const newProduct = {
      ...updates,
      id,
      createdAt: updates.createdAt || new Date().toISOString(),
    };
    products.unshift(newProduct);
    writeJsonFile(PRODUCTS_FILE, products);
    return res.json(newProduct);
  }

  const updatedProduct = {
    ...products[index],
    ...updates,
    id, // Guarantee ID is never modified
  };

  products[index] = updatedProduct;
  writeJsonFile(PRODUCTS_FILE, products);

  res.json(updatedProduct);
});

// DELETE a product (Admin Only)
app.delete('/api/products/:id', verifyAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const filtered = products.filter((p) => p.id !== id);

  writeJsonFile(PRODUCTS_FILE, filtered);
  res.json({ success: true, id });
});

// POST bulk sync / seed products (Admin Only)
app.post('/api/products/sync', verifyAdminMiddleware, (req, res) => {
  const { products } = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: 'Expected products array' });
  }

  const existing = readJsonFile<any[]>(PRODUCTS_FILE, []);
  
  // Merge: keep all products with unique IDs
  const map = new Map<string, any>();
  existing.forEach((p) => map.set(p.id, p));
  products.forEach((p) => map.set(p.id, p));

  const merged = Array.from(map.values());
  writeJsonFile(PRODUCTS_FILE, merged);

  res.json({ success: true, count: merged.length });
});

// GET categories (Public)
app.get('/api/categories', (req, res) => {
  const categories = readJsonFile<string[]>(CATEGORIES_FILE, []);
  res.json(categories);
});

// POST add category (Admin Only)
app.post('/api/categories', verifyAdminMiddleware, (req, res) => {
  const { category } = req.body;
  if (!category || typeof category !== 'string') {
    return res.status(400).json({ error: 'Category string required' });
  }

  const trimmed = category.trim();
  const categories = readJsonFile<string[]>(CATEGORIES_FILE, []);
  if (!categories.includes(trimmed)) {
    categories.push(trimmed);
    writeJsonFile(CATEGORIES_FILE, categories);
  }

  res.json({ success: true, categories });
});

// DELETE category (Admin Only)
app.delete('/api/categories/:name', verifyAdminMiddleware, (req, res) => {
  const { name } = req.params;
  const categories = readJsonFile<string[]>(CATEGORIES_FILE, []);
  const filtered = categories.filter((c) => c !== decodeURIComponent(name));
  writeJsonFile(CATEGORIES_FILE, filtered);
  res.json({ success: true, categories: filtered });
});

// --- ORDERS API (Persistent Database with Validation & Security) ---

// GET all orders (Admin only, newest first)
app.get('/api/orders', verifyAdminMiddleware, (req, res) => {
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  // Sort newest first by createdAt timestamp
  orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  res.json(orders);
});

// POST create order (Public checkout with strict validation)
app.post('/api/orders', (req, res) => {
  const body = req.body;
  if (!body) {
    return res.status(400).json({ error: 'Order data is required' });
  }

  const { customerName, contactNumber, address, city, items, paymentMethod } = body;

  // Validation
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    return res.status(400).json({ error: 'Customer full name is required (minimum 2 characters)' });
  }
  if (!contactNumber || typeof contactNumber !== 'string' || contactNumber.trim().length < 7) {
    return res.status(400).json({ error: 'Valid customer contact number is required' });
  }
  if (!address || typeof address !== 'string' || address.trim().length < 3) {
    return res.status(400).json({ error: 'Complete delivery address is required' });
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return res.status(400).json({ error: 'Delivery city is required' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  // Validate items and calculate totals
  let computedSubtotal = 0;
  for (const item of items) {
    if (!item.product || typeof item.product.price !== 'number' || typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product or quantity in order items' });
    }
    computedSubtotal += item.product.price * item.quantity;
  }

  const discount = typeof body.discount === 'number' ? Math.max(0, body.discount) : 0;
  const shippingFee = typeof body.shippingFee === 'number' ? Math.max(0, body.shippingFee) : 0;
  const finalAmount = typeof body.finalAmount === 'number' ? body.finalAmount : Math.max(0, computedSubtotal - discount + shippingFee);

  // Generate unique Order ID if not supplied
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = body.id && typeof body.id === 'string' && body.id.trim()
    ? body.id.trim()
    : `HZC-${randomSuffix}`;

  const validStatuses = ['New', 'Printed', 'Booked', 'Dispatched', 'Delivered', 'Cancelled', 'Pending', 'Confirmed', 'Shipped'];
  const status = validStatuses.includes(body.status) ? body.status : 'New';

  const newOrder = {
    id: orderId,
    customerName: customerName.trim(),
    contactNumber: contactNumber.trim(),
    whatsappNumber: (body.whatsappNumber || contactNumber).trim(),
    address: address.trim(),
    city: city.trim(),
    postalCode: body.postalCode || '',
    specialInstructions: body.specialInstructions || '',
    items,
    paymentMethod: paymentMethod === 'advance' ? 'advance' : 'cod',
    subtotal: computedSubtotal,
    discount,
    shippingFee,
    finalAmount,
    paymentScreenshot: body.paymentScreenshot || null,
    status,
    createdAt: body.createdAt || new Date().toISOString(),
    printedAt: body.printedAt || null,
    trackingNumber: body.trackingNumber || null,
    courierCompany: body.courierCompany || 'M&P Express Logistics',
    courierBookingStatus: body.courierBookingStatus || 'Not Booked',
  };

  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  // Insert at beginning (newest first)
  const updatedOrders = [newOrder, ...orders.filter((o) => o.id !== newOrder.id)];
  writeJsonFile(ORDERS_FILE, updatedOrders);

  res.status(201).json(newOrder);
});

// PUT update order status
app.put('/api/orders/:id/status', verifyAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber, courierBookingStatus, printedAt } = req.body;

  const validStatuses = ['New', 'Printed', 'Booked', 'Dispatched', 'Delivered', 'Cancelled', 'Pending', 'Confirmed', 'Shipped'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[index].status = status;
  if (status === 'Printed' && !orders[index].printedAt) {
    orders[index].printedAt = printedAt || new Date().toISOString();
  }
  if (trackingNumber !== undefined) {
    orders[index].trackingNumber = trackingNumber;
  }
  if (courierBookingStatus !== undefined) {
    orders[index].courierBookingStatus = courierBookingStatus;
  }

  writeJsonFile(ORDERS_FILE, orders);
  res.json(orders[index]);
});

// PUT update entire order
app.put('/api/orders/:id', verifyAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[index] = {
    ...orders[index],
    ...updates,
    id, // Guard against ID modification
  };

  writeJsonFile(ORDERS_FILE, orders);
  res.json(orders[index]);
});

// DELETE order
app.delete('/api/orders/:id', verifyAdminMiddleware, (req, res) => {
  const { id } = req.params;
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const filtered = orders.filter((o) => o.id !== id);

  writeJsonFile(ORDERS_FILE, filtered);
  res.json({ success: true, id });
});

// --- SERVER INITIALIZATION ---
async function start() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Store Server] Hasnain Zarri Chappal running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Store Server Error]:', err);
});
