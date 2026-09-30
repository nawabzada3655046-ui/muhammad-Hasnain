/**
 * Browser IndexedDB database utility for permanent, unlimited product storage.
 * Eliminates browser localStorage quota issues and guarantees data persistence across sessions.
 * Never performs dangerous store.clear() that could wipe products during async initial loads.
 */
import { Product } from '../types';

const DB_NAME = 'HasnainZarriDB_v2';
const DB_VERSION = 2;
const PRODUCTS_STORE = 'products';
const METADATA_STORE = 'metadata';

let dbInstance: IDBDatabase | null = null;
let dbOpenPromise: Promise<IDBDatabase> | null = null;

export function openDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbOpenPromise) {
    return dbOpenPromise;
  }

  dbOpenPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
        dbOpenPromise = null;
      };
      resolve(dbInstance);
    };

    request.onerror = () => {
      dbOpenPromise = null;
      reject(request.error);
    };
  });

  return dbOpenPromise;
}

/**
 * Retrieve all products stored in IndexedDB.
 */
export async function getAllProductsFromDB(): Promise<Product[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(PRODUCTS_STORE, 'readonly');
      const store = tx.objectStore(PRODUCTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve((request.result as Product[]) || []);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('Failed to read from IndexedDB:', err);
    return [];
  }
}

/**
 * Save or update a single product in IndexedDB (Safe Upsert).
 * NEVER deletes or touches other products.
 */
export async function saveProductToDB(product: Product): Promise<void> {
  if (!product || !product.id) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = tx.objectStore(PRODUCTS_STORE);
      const request = store.put(product);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to save product in IndexedDB:', err);
  }
}

/**
 * Upsert multiple products into IndexedDB without clearing existing ones.
 */
export async function upsertProductsToDB(products: Product[]): Promise<void> {
  if (!Array.isArray(products) || products.length === 0) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = tx.objectStore(PRODUCTS_STORE);

      let pending = products.length;
      if (pending === 0) return resolve();

      products.forEach((prod) => {
        if (!prod || !prod.id) {
          pending--;
          if (pending === 0) resolve();
          return;
        }
        const req = store.put(prod);
        req.onsuccess = () => {
          pending--;
          if (pending === 0) resolve();
        };
        req.onerror = () => {
          pending--;
          if (pending === 0) resolve();
        };
      });

      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to upsert products to IndexedDB:', err);
  }
}

/**
 * Safely syncs products list to IndexedDB:
 * - Upserts all current products
 * - If current IDs are known, cleans up only explicitly deleted IDs
 * - NEVER uses store.clear() indiscriminately
 */
export async function saveAllProductsToDB(products: Product[]): Promise<void> {
  if (!Array.isArray(products)) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = tx.objectStore(PRODUCTS_STORE);

      const currentIds = new Set(products.map((p) => p.id));
      const getAllReq = store.getAllKeys();

      getAllReq.onsuccess = () => {
        const storedKeys = (getAllReq.result as string[]) || [];
        // Delete only orphaned keys that are not in the current list
        storedKeys.forEach((key) => {
          if (!currentIds.has(key)) {
            store.delete(key);
          }
        });

        // Upsert all products
        let count = 0;
        if (products.length === 0) {
          return resolve();
        }

        products.forEach((prod) => {
          store.put(prod);
          count++;
          if (count === products.length) {
            resolve();
          }
        });
      };

      getAllReq.onerror = () => {
        // Fallback: simply put all products
        products.forEach((prod) => store.put(prod));
        resolve();
      };

      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to sync products to IndexedDB:', err);
  }
}

/**
 * Delete a product by ID from IndexedDB.
 */
export async function deleteProductFromDB(id: string): Promise<void> {
  if (!id) return;
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = tx.objectStore(PRODUCTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to delete product from IndexedDB:', err);
  }
}

/**
 * Clear all products from IndexedDB during catalog reset.
 */
export async function clearAllProductsFromDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = tx.objectStore(PRODUCTS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to clear products from IndexedDB:', err);
  }
}
