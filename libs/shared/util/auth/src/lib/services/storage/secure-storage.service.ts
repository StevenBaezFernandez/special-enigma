import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private encryptionKey: CryptoKey | null = null;
  private readonly DB_NAME = 'virteex_secure_db';
  private readonly STORE_NAME = 'keys';
  private readonly KEY_ID = 'session_encryption_key';

  constructor() {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.crypto !== 'undefined' && typeof window.indexedDB !== 'undefined';
  }

  private async getCrypto(): Promise<SubtleCrypto> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      return window.crypto.subtle;
    }
    throw new Error('Web Crypto API not available');
  }

  private openDB(): Promise<IDBDatabase> {
      return new Promise((resolve, reject) => {
          const request = indexedDB.open(this.DB_NAME, 1);
          request.onupgradeneeded = () => {
              request.result.createObjectStore(this.STORE_NAME);
          };
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
      });
  }

  private getKeyFromDB(db: IDBDatabase): Promise<CryptoKey | null> {
      return new Promise((resolve, reject) => {
          const transaction = db.transaction(this.STORE_NAME, 'readonly');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.get(this.KEY_ID);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => reject(request.error);
      });
  }

  private saveKeyToDB(db: IDBDatabase, key: CryptoKey): Promise<void> {
      return new Promise((resolve, reject) => {
          const transaction = db.transaction(this.STORE_NAME, 'readwrite');
          const store = transaction.objectStore(this.STORE_NAME);
          const request = store.put(key, this.KEY_ID);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }

  private async initWebCrypto() {
    if (!this.isBrowser()) return;

    try {
        const subtle = await this.getCrypto();
        const db = await this.openDB();
        let key = await this.getKeyFromDB(db);

        if (!key) {
            key = await subtle.generateKey(
                {
                name: 'AES-GCM',
                length: 256
                },
                false, // Key is NOT extractable, increasing security against XSS stealing raw key
                ['encrypt', 'decrypt']
            );
            await this.saveKeyToDB(db, key);
        }
        this.encryptionKey = key;
    } catch (e) {
        console.error('Failed to initialize SecureStorage with IndexedDB', e);
        // Fallback or cleanup if needed
        localStorage.removeItem('virteex_secure_storage_key'); // Cleanup old insecure key if exists
    }
  }

  private async encryptValue(value: string): Promise<string> {
    if (!this.encryptionKey) await this.initWebCrypto();
    if (!this.encryptionKey) throw new Error('Encryption key not initialized');

    const subtle = await this.getCrypto();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedValue = new TextEncoder().encode(value);

    const encryptedContent = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      this.encryptionKey,
      encodedValue
    );

    const ivString = btoa(String.fromCharCode(...iv));
    const encryptedString = btoa(String.fromCharCode(...new Uint8Array(encryptedContent)));

    return `${ivString}.${encryptedString}`;
  }

  private async decryptValue(encryptedValue: string): Promise<string | null> {
    if (!this.encryptionKey) await this.initWebCrypto();
    if (!this.encryptionKey) return null;

    try {
      const parts = encryptedValue.split('.');
      if (parts.length !== 2) return null;

      const subtle = await this.getCrypto();

      const ivString = atob(parts[0]);
      const iv = new Uint8Array(ivString.length);
      for(let i=0; i<ivString.length; i++) iv[i] = ivString.charCodeAt(i);

      const encryptedString = atob(parts[1]);
      const encryptedContent = new Uint8Array(encryptedString.length);
      for(let i=0; i<encryptedString.length; i++) encryptedContent[i] = encryptedString.charCodeAt(i);

      const decryptedContent = await subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encryptedContent
      );

      return new TextDecoder().decode(decryptedContent);
    } catch (e) {
      console.error('Decryption failed', e);
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await SecureStoragePlugin.set({ key, value });
      } catch (error) {
        console.error('SecureStorage set error', error);
      }
    } else {
      if (!this.isBrowser()) return;
      try {
        const encrypted = await this.encryptValue(value);
        sessionStorage.setItem(key, encrypted);
      } catch (e) {
         console.error('Encryption failed during set', e);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      try {
        const { value } = await SecureStoragePlugin.get({ key });
        return value;
      } catch (error) {
        return null;
      }
    } else {
      if (!this.isBrowser()) return null;
      const encrypted = sessionStorage.getItem(key);
      if (!encrypted) return null;
      return await this.decryptValue(encrypted);
    }
  }

  async remove(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
        try {
            await SecureStoragePlugin.remove({ key });
        } catch (error) {
            console.warn('SecureStorage remove error', error);
        }
    } else {
       if (this.isBrowser()) {
         sessionStorage.removeItem(key);
       }
    }
  }

  async clear(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
        try {
            await SecureStoragePlugin.clear();
        } catch (error) {
            console.warn('SecureStorage clear error', error);
        }
    } else {
        if (this.isBrowser()) {
            sessionStorage.clear();
        }
    }
  }
}
