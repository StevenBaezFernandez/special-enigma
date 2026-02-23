import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private encryptionKey: CryptoKey | null = null;
  private readonly KEY_STORAGE_NAME = 'virteex_secure_storage_key';

  constructor() {
    if (this.isBrowser() && !Capacitor.isNativePlatform()) {
      // Lazy init or init on construction?
      // Init on construction might be too early for async.
      // We'll init on demand in encrypt/decrypt methods.
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.crypto !== 'undefined';
  }

  private async getCrypto(): Promise<SubtleCrypto> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      return window.crypto.subtle;
    }
    throw new Error('Web Crypto API not available');
  }

  private async initWebCrypto() {
    if (!this.isBrowser()) return;

    try {
        const subtle = await this.getCrypto();
        // Try to load existing key
        const storedKey = localStorage.getItem(this.KEY_STORAGE_NAME);
        if (storedKey) {
            try {
                const binaryString = atob(storedKey);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                this.encryptionKey = await subtle.importKey(
                'raw',
                bytes,
                { name: 'AES-GCM' },
                true,
                ['encrypt', 'decrypt']
                );
            } catch (e) {
                console.warn('Failed to import existing key, generating new one', e);
            }
        }

        if (!this.encryptionKey) {
            const key = await subtle.generateKey(
                {
                name: 'AES-GCM',
                length: 256
                },
                true,
                ['encrypt', 'decrypt']
            );
            this.encryptionKey = key;
            const exportedKey = await subtle.exportKey('raw', key);

            const bytes = new Uint8Array(exportedKey);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const keyString = btoa(binary);

            localStorage.setItem(this.KEY_STORAGE_NAME, keyString);
        }
    } catch (e) {
        console.error('Failed to initialize Web Crypto', e);
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
      if (!this.isBrowser()) return; // SSR no-op
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
