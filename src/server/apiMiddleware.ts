import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DEFAULT_INITIAL_PRODUCTS, DEFAULT_INITIAL_CATEGORIES } from './defaultData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root data directory
const DATA_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const PRODUCTS_FILE = path.join(DATA_DIR, 'products_db.json');
export const CATEGORIES_FILE = path.join(DATA_DIR, 'categories_db.json');

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
      // 1. /api/health
      if (url === '/api/health') {
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
        return;
      }

      // 2. /api/products/sync (POST)
      if (url === '/api/products/sync' && method === 'POST') {
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

      // 4. /api/products/:id (PUT & DELETE)
      const productMatch = url.match(/^\/api\/products\/([^/?]+)/);
      if (productMatch && productMatch[1] && productMatch[1] !== 'sync') {
        const id = decodeURIComponent(productMatch[1]);
        const products = readJsonFile<any[]>(PRODUCTS_FILE, DEFAULT_INITIAL_PRODUCTS);

        if (method === 'PUT') {
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
        const name = decodeURIComponent(catDeleteMatch[1]);
        const categories = readJsonFile<string[]>(CATEGORIES_FILE, DEFAULT_INITIAL_CATEGORIES);
        const filtered = categories.filter((c) => c !== name);
        writeJsonFile(CATEGORIES_FILE, filtered);

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, categories: filtered }));
        return;
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
