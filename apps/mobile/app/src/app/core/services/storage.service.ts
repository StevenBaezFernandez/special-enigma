import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'virteex_mobile_db';
  private storeName = 'keyvalue_store';
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
        console.warn('IndexedDB not supported, falling back to memory/localstorage might be needed');
        // Fallback logic could be added here, but for now we assume modern browser/webview
        return Promise.reject('IndexedDB not supported');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = (event) => {
        console.error('IndexedDB error:', event);
        reject('IndexedDB error');
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
            db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
            resolve(request.result as T || null);
        };
        request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('Storage Get Error', e);
        return null;
    }
  }

  async set(key: string, value: any): Promise<void> {
    try {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('Storage Set Error', e);
        throw e;
    }
  }

  async remove(key: string): Promise<void> {
    try {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.error('Storage Remove Error', e);
        throw e;
    }
  }
}
