import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_INITIAL_PRODUCTS, DEFAULT_INITIAL_CATEGORIES } from './defaultData.ts';
import {
  verifyAdminToken,
  loginAdminBackend,
  changeAdminPasswordBackend,
  revokeAdminToken,
  ensureAdminAuthInitialized,
  ADMIN_RECOVERY_EMAIL,
  REQUIRED_POST_RESET_PASSWORD,
  getEmailDeliveryConfigStatus,
  requestPasswordResetOTP,
  verifyPasswordResetOTP,
  resetAdminPasswordWithOTP,
} from './auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root data directory
const DATA_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const PRODUCTS_FILE = path.join(DATA_DIR, 'products_db.json');
export const CATEGORIES_FILE = path.join(DATA_DIR, 'categories_db.json');
export const ORDERS_FILE = path.join(DATA_DIR, 'orders_db.json');

// Helper to normalize phone numbers for customer order lookup
export function normalizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('92') && digits.length >= 11) {
    digits = digits.substring(2);
  }
  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  return digits;
}

// Helper to safely read JSON file
export function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.warn(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to safely write JSON file
export function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    const tempPath = `${filePath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Ensure database files are pre-seeded if not present
export function ensureDatabaseSeeded() {
  if (!fs.existsSync(PRODUCTS_FILE) || fs.readFileSync(PRODUCTS_FILE, 'utf-8').trim() === '') {
    writeJsonFile(PRODUCTS_FILE, DEFAULT_INITIAL_PRODUCTS);
  }
  if (!fs.existsSync(CATEGORIES_FILE) || fs.readFileSync(CATEGORIES_FILE, 'utf-8').trim() === '') {
    writeJsonFile(CATEGORIES_FILE, DEFAULT_INITIAL_CATEGORIES);
  }
}

// Initialize on module load
ensureDatabaseSeeded();

// Helper to parse JSON body from incoming Node.js IncomingMessage
function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body.trim()) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

// Connect/Express middleware for Vite & Server
export function createApiMiddleware() {
  ensureDatabaseSeeded();

  return async function apiMiddleware(req: any, res: any, next: () => void) {
    const url = req.url || '';
    const method = req.method || 'GET';

    if (!url.startsWith('/api/')) {
      return next();
    }

    res.setHeader('Content-Type', 'application/json');

    try {
      // Helper to enforce admin authorization
      const checkAdmin = (): boolean => {
        const authHeader = req.headers?.['authorization'] || req.headers?.['x-admin-token'];
        const token = typeof authHeader === 'string' ? authHeader : '';
        if (!verifyAdminToken(token)) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: 'Unauthorized: Admin authentication required' }));
          return false;
        }
        return true;
      };

      // 1. /api/health
      if (url === '/api/health') {
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }

      // --- Admin Authentication Endpoints ---
      if (url === '/api/admin/login' && method === 'POST') {
        const body = await parseBody(req);
        const result = loginAdminBackend(body.password);
        if (!result.success) {
          res.statusCode = 401;
          res.end(JSON.stringify({ error: result.error || 'Invalid admin password' }));
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, token: result.token, message: 'Admin authentication successful' }));
        return;
      }

      if (url === '/api/admin/verify') {
        const authHeader = req.headers?.['authorization'] || req.headers?.['x-admin-token'];
        const token = typeof authHeader === 'string' ? authHeader : '';
        if (verifyAdminToken(token)) {
          res.statusCode = 200;
          res.end(JSON.stringify({ authenticated: true }));
          return;
        }
        res.statusCode = 401;
        res.end(JSON.stringify({ authenticated: false, error: 'Unauthorized: Invalid or expired admin session' }));
        return;
      }

      if (url === '/api/admin/logout' && method === 'POST') {
        const authHeader = req.headers?.['authorization'] || req.headers?.['x-admin-token'];
        const token = typeof authHeader === 'string' ? authHeader : '';
        revokeAdminToken(token);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: 'Logged out successfully' }));
        return;
      }

      if (url === '/api/admin/change-password' && method === 'POST') {
        if (!checkAdmin()) return;
        const body = await parseBody(req);
        const result = changeAdminPasswordBackend(body.currentPassword, body.newPassword);
        if (!result.success) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: result.error || 'Failed to update admin password' }));
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: result.message }));
        return;
      }

      // Password Recovery Endpoints
      if (url === '/api/admin/recovery-status') {
        const config = getEmailDeliveryConfigStatus();
        res.statusCode = 200;
        res.end(
          JSON.stringify({
            registeredEmail: ADMIN_RECOVERY_EMAIL,
            requiredPostResetPassword: REQUIRED_POST_RESET_PASSWORD,
            emailDelivery: config,
          })
        );
        return;
      }

      if (url === '/api/admin/request-password-reset' && method === 'POST') {
        const body = await parseBody(req);
        const result = await requestPasswordResetOTP(body.email);
        if (!result.success) {
          const statusCode = result.configStatus && !result.configStatus.isConfigured ? 503 : 400;
          res.statusCode = statusCode;
          res.end(
            JSON.stringify({
              success: false,
              error: result.error,
              configStatus: result.configStatus,
            })
          );
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: result.message }));
        return;
      }

      if (url === '/api/admin/verify-reset-otp' && method === 'POST') {
        const body = await parseBody(req);
        const result = verifyPasswordResetOTP(body.email, body.otp);
        if (!result.success) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: result.error }));
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, resetToken: result.resetToken }));
        return;
      }

      if (url === '/api/admin/reset-password' && method === 'POST') {
        const body = await parseBody(req);
        const result = resetAdminPasswordWithOTP(body.email, body.otp, body.newPassword, body.resetToken);
        if (!result.success) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: result.error }));
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: result.message }));
        return;
      }

      // 2. /api/products/sync (POST - Admin Only)
      if (url === '/api/products/sync' && method === 'POST') {
        if (!checkAdmin()) return;
        const body = await parseBody(req);
        const { products } = body;
        if (!Array.isArray(products)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Expected products array' }));
          return;
        }

        const existing = readJsonFile<any[]>(PRODUCTS_FILE, DEFAULT_INITIAL_PRODUCTS);
        const map = new Map<string, any>();
        existing.forEach((p) => map.set(p.id, p));
        products.forEach((p) => map.set(p.id, p));

        const merged = Array.from(map.values());
        writeJsonFile(PRODUCTS_FILE, merged);

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, count: merged.length }));
        return;
      }

      // 3. /api/products (GET & POST)
      if (url === '/api/products' || url.startsWith('/api/products?')) {
        if (method === 'GET') {
          const products = readJsonFile<any[]>(PRODUCTS_FILE, DEFAULT_INITIAL_PRODUCTS);
          res.statusCode = 200;
          res.end(JSON.stringify(products));
          return;
        }

        if (method === 'POST') {
          if (!checkAdmin()) return;
          const productData = await parseBody(req);
          if (!productData || !productData.title) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Product title is required' }));
            return;
          }

          const products = readJsonFile<any[]>(PRODUCTS_FILE, DEFAULT_INITIAL_PRODUCTS);

          // Unique ID assignment
          const uniqueId =
            productData.id && !products.some((p) => p.id === productData.id)
              ? productData.id
              : `hzc-prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

          const newProduct = {
            ...productData,
            id: uniqueId,
            createdAt: productData.createdAt || new Date().toISOString(),
            isActive: productData.isActive !== false,
          };

          // Prepend new product so it is at the top of the catalog
          const updated = [newProduct, ...products.filter((p) => p.id !== uniqueId)];
          writeJsonFile(PRODUCTS_FILE, updated);

          res.statusCode = 201;
          res.end(JSON.stringify(newProduct));
          return;
        }
      }

      // 4. /api/products/:id (PUT & DELETE - Admin Only)
      const productMatch = url.match(/^\/api\/products\/([^/?]+)/);
      if (productMatch && productMatch[1] && productMatch[1] !== 'sync') {
        const id = decodeURIComponent(productMatch[1]);
        const products = readJsonFile<any[]>(PRODUCTS_FILE, DEFAULT_INITIAL_PRODUCTS);

        if (method === 'PUT') {
          if (!checkAdmin()) return;
          const updates = await parseBody(req);
          const index = products.findIndex((p) => p.id === id);

          if (index === -1) {
            const newProduct = {
              ...updates,
              id,
              createdAt: updates.createdAt || new Date().toISOString(),
            };
            products.unshift(newProduct);
            writeJsonFile(PRODUCTS_FILE, products);
            res.statusCode = 200;
            res.end(JSON.stringify(newProduct));
            return;
          }

          const updatedProduct = {
            ...products[index],
            ...updates,
            id, // ID must remain immutable
          };

          products[index] = updatedProduct;
          writeJsonFile(PRODUCTS_FILE, products);

          res.statusCode = 200;
          res.end(JSON.stringify(updatedProduct));
          return;
        }

        if (method === 'DELETE') {
          if (!checkAdmin()) return;
          const filtered = products.filter((p) => p.id !== id);
          writeJsonFile(PRODUCTS_FILE, filtered);

          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, id }));
          return;
        }
      }

      // 5. /api/categories (GET, POST, DELETE)
      if (url === '/api/categories' || url.startsWith('/api/categories?')) {
        if (method === 'GET') {
          const categories = readJsonFile<string[]>(CATEGORIES_FILE, DEFAULT_INITIAL_CATEGORIES);
          res.statusCode = 200;
          res.end(JSON.stringify(categories));
          return;
        }

        if (method === 'POST') {
          if (!checkAdmin()) return;
          const body = await parseBody(req);
          const { category } = body;
          if (!category || typeof category !== 'string') {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Category string required' }));
            return;
          }

          const trimmed = category.trim();
          const categories = readJsonFile<string[]>(CATEGORIES_FILE, DEFAULT_INITIAL_CATEGORIES);
          if (!categories.includes(trimmed)) {
            categories.push(trimmed);
            writeJsonFile(CATEGORIES_FILE, categories);
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, categories }));
          return;
        }
      }

      const catDeleteMatch = url.match(/^\/api\/categories\/([^/?]+)/);
      if (catDeleteMatch && method === 'DELETE') {
        if (!checkAdmin()) return;
        const name = decodeURIComponent(catDeleteMatch[1]);
        const categories = readJsonFile<string[]>(CATEGORIES_FILE, DEFAULT_INITIAL_CATEGORIES);
        const filtered = categories.filter((c) => c !== name);
        writeJsonFile(CATEGORIES_FILE, filtered);

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, categories: filtered }));
        return;
      }

      // 6. /api/orders/lookup (POST - Public "My Order" verification)
      if (url === '/api/orders/lookup' && method === 'POST') {
        const body = await parseBody(req);
        const { orderId, contactNumber } = body || {};
        if (!orderId || typeof orderId !== 'string' || !contactNumber || typeof contactNumber !== 'string') {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Order ID and Contact Phone Number are both required.' }));
          return;
        }

        const cleanOrderId = orderId.trim().toUpperCase().replace(/^#/, '');
        const cleanPhone = normalizePhoneNumber(contactNumber);

        if (!cleanOrderId || !cleanPhone) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Please enter a valid Order ID and Contact Phone Number.' }));
          return;
        }

        const orders = readJsonFile<any[]>(ORDERS_FILE, []);
        const matchingOrder = orders.find((o) => {
          const oId = (o.id || '').trim().toUpperCase().replace(/^#/, '');
          if (oId !== cleanOrderId) return false;
          const oPhone1 = normalizePhoneNumber(o.contactNumber || '');
          const oPhone2 = normalizePhoneNumber(o.whatsappNumber || '');
          return oPhone1 === cleanPhone || oPhone2 === cleanPhone;
        });

        if (!matchingOrder) {
          res.statusCode = 404;
          res.end(
            JSON.stringify({
              error: `No matching order found for Order ID #${cleanOrderId} and the provided phone number. Please verify your details and try again.`,
            })
          );
          return;
        }

        const safeOrder = { ...matchingOrder };
        delete safeOrder.adminNotes;

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, order: safeOrder }));
        return;
      }

      // 7. /api/orders (GET - Admin Only, POST - Public Order Creation)
      if (url === '/api/orders' || url.startsWith('/api/orders?')) {
        if (method === 'GET') {
          if (!checkAdmin()) return;
          const orders = readJsonFile<any[]>(ORDERS_FILE, []);
          orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          res.statusCode = 200;
          res.end(JSON.stringify(orders));
          return;
        }

        if (method === 'POST') {
          const body = await parseBody(req);
          if (!body) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Order data is required' }));
            return;
          }

          const { customerName, contactNumber, address, city, items, paymentMethod } = body;

          if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Customer full name is required (minimum 2 characters)' }));
            return;
          }
          if (!contactNumber || typeof contactNumber !== 'string' || contactNumber.trim().length < 7) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Valid customer contact number is required' }));
            return;
          }
          if (!address || typeof address !== 'string' || address.trim().length < 3) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Complete delivery address is required' }));
            return;
          }
          if (!city || typeof city !== 'string' || city.trim().length < 2) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Delivery city is required' }));
            return;
          }
          if (!Array.isArray(items) || items.length === 0) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Order must contain at least one item' }));
            return;
          }

          let computedSubtotal = 0;
          for (const item of items) {
            if (!item.product || typeof item.product.price !== 'number' || typeof item.quantity !== 'number' || item.quantity <= 0) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid product or quantity in order items' }));
              return;
            }
            computedSubtotal += item.product.price * item.quantity;
          }

          const discount = typeof body.discount === 'number' ? Math.max(0, body.discount) : 0;
          const shippingFee = typeof body.shippingFee === 'number' ? Math.max(0, body.shippingFee) : 0;
          const finalAmount = typeof body.finalAmount === 'number' ? body.finalAmount : Math.max(0, computedSubtotal - discount + shippingFee);

          const orders = readJsonFile<any[]>(ORDERS_FILE, []);

          // Duplicate prevention within 5s
          const cleanPhone = normalizePhoneNumber(contactNumber);
          const nowTime = Date.now();
          const duplicateOrder = orders.find((o) => {
            if (normalizePhoneNumber(o.contactNumber || '') !== cleanPhone) return false;
            if (o.finalAmount !== finalAmount) return false;
            const diff = Math.abs(nowTime - new Date(o.createdAt || 0).getTime());
            return diff < 5000;
          });

          if (duplicateOrder) {
            res.statusCode = 200;
            res.end(JSON.stringify(duplicateOrder));
            return;
          }

          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          let orderId = body.id && typeof body.id === 'string' && body.id.trim()
            ? body.id.trim().toUpperCase()
            : `HZC-${randomSuffix}`;

          if (orders.some((o) => o.id === orderId)) {
            orderId = `HZC-${Math.floor(1000 + Math.random() * 9000)}`;
          }

          const validStatuses = ['In Processed', 'Dispatch', 'Arrived', 'Out for Delivery', 'Delivered', 'Cancelled', 'New', 'Printed', 'Booked', 'Dispatched', 'Pending', 'Confirmed', 'Shipped'];
          const status = validStatuses.includes(body.status) ? body.status : 'In Processed';

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
            statusUpdatedAt: new Date().toISOString(),
            printedAt: body.printedAt || null,
            courierName: body.courierName || 'M&P Express Logistics',
            trackingNumber: body.trackingNumber || null,
            trackingUrl: body.trackingUrl || null,
            dispatchDate: body.dispatchDate || null,
            adminNotes: body.adminNotes || null,
            courierCompany: body.courierCompany || 'M&P Express Logistics',
            courierBookingStatus: body.courierBookingStatus || 'Not Booked',
          };

          const updatedOrders = [newOrder, ...orders.filter((o) => o.id !== newOrder.id)];
          writeJsonFile(ORDERS_FILE, updatedOrders);

          res.statusCode = 201;
          res.end(JSON.stringify(newOrder));
          return;
        }
      }

      // 8. /api/orders/:id/tracking (PUT - Admin Only)
      const trackingMatch = url.match(/^\/api\/orders\/([^/?]+)\/tracking/);
      if (trackingMatch && method === 'PUT') {
        if (!checkAdmin()) return;
        const id = decodeURIComponent(trackingMatch[1]);
        const body = await parseBody(req);
        const { status, courierName, trackingNumber, trackingUrl, dispatchDate, adminNotes } = body || {};

        const validStatuses = ['In Processed', 'Dispatch', 'Arrived', 'Out for Delivery', 'Delivered', 'Cancelled', 'New', 'Printed', 'Booked', 'Dispatched', 'Pending', 'Confirmed', 'Shipped'];
        if (status && !validStatuses.includes(status)) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'Invalid status' }));
          return;
        }

        const orders = readJsonFile<any[]>(ORDERS_FILE, []);
        const index = orders.findIndex((o) => o.id === id);

        if (index === -1) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Order not found' }));
          return;
        }

        const current = orders[index];
        const updatedOrder = {
          ...current,
          status: status || current.status,
          courierName: courierName !== undefined ? courierName : current.courierName,
          trackingNumber: trackingNumber !== undefined ? trackingNumber : current.trackingNumber,
          trackingUrl: trackingUrl !== undefined ? trackingUrl : current.trackingUrl,
          dispatchDate: dispatchDate !== undefined ? dispatchDate : current.dispatchDate,
          adminNotes: adminNotes !== undefined ? adminNotes : current.adminNotes,
          statusUpdatedAt: new Date().toISOString(),
        };

        orders[index] = updatedOrder;
        writeJsonFile(ORDERS_FILE, orders);

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, order: updatedOrder }));
        return;
      }

      // 9. /api/orders/:id/status (PUT - Admin Only)
      const statusMatch = url.match(/^\/api\/orders\/([^/?]+)\/status/);
      if (statusMatch && method === 'PUT') {
        if (!checkAdmin()) return;
        const id = decodeURIComponent(statusMatch[1]);
        const body = await parseBody(req);
        const { status, trackingNumber, courierBookingStatus, printedAt } = body || {};

        const orders = readJsonFile<any[]>(ORDERS_FILE, []);
        const index = orders.findIndex((o) => o.id === id);

        if (index === -1) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Order not found' }));
          return;
        }

        if (status) orders[index].status = status;
        orders[index].statusUpdatedAt = new Date().toISOString();
        if (trackingNumber !== undefined) orders[index].trackingNumber = trackingNumber;
        if (courierBookingStatus !== undefined) orders[index].courierBookingStatus = courierBookingStatus;
        if (printedAt !== undefined) orders[index].printedAt = printedAt;

        writeJsonFile(ORDERS_FILE, orders);
        res.statusCode = 200;
        res.end(JSON.stringify(orders[index]));
        return;
      }

      // 10. /api/orders/:id (PUT & DELETE - Admin Only)
      const orderMatch = url.match(/^\/api\/orders\/([^/?]+)/);
      if (orderMatch && orderMatch[1] && orderMatch[1] !== 'lookup') {
        const id = decodeURIComponent(orderMatch[1]);
        const orders = readJsonFile<any[]>(ORDERS_FILE, []);

        if (method === 'PUT') {
          if (!checkAdmin()) return;
          const updates = await parseBody(req);
          const index = orders.findIndex((o) => o.id === id);
          if (index === -1) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Order not found' }));
            return;
          }
          orders[index] = { ...orders[index], ...updates, id };
          writeJsonFile(ORDERS_FILE, orders);
          res.statusCode = 200;
          res.end(JSON.stringify(orders[index]));
          return;
        }

        if (method === 'DELETE') {
          if (!checkAdmin()) return;
          const filtered = orders.filter((o) => o.id !== id);
          writeJsonFile(ORDERS_FILE, filtered);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, id }));
          return;
        }
      }

      // Unmatched API endpoint
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
    } catch (error: any) {
      console.error('API middleware error:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Internal server error', details: error?.message }));
    }
  };
}
