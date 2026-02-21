import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private memoryStorage: Map<string, string> = new Map();

  async set(key: string, value: string): Promise<void> {
    if (this.isBrowser()) {
      // BROWSER FALLBACK:
      // In a real production PWA, this should use IndexedDB with Web Crypto API.
      // For this audit remediation, we move away from localStorage to sessionStorage
      // to reduce persistent XSS vector (cleared on tab close) and perform basic obfuscation.
      // This is NOT encryption-at-rest but prevents casual token extraction via devtools.
      // TODO: Implement Web Crypto API with non-exportable key.
      const encoded = btoa(value);
      sessionStorage.setItem(key, encoded);
    } else {
      // NATIVE MOBILE:
      // This is where the @capacitor-community/secure-storage-sqlite plugin would be called.
      // Due to sandbox limitations preventing plugin installation, this interface mimics the native behavior.
      // In production build, this would map to: await SecureStoragePlugin.set({ key, value });
      this.memoryStorage.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.isBrowser()) {
      const encoded = sessionStorage.getItem(key);
      if (!encoded) return null;
      try {
        return atob(encoded);
      } catch {
        return null;
      }
    } else {
      return this.memoryStorage.get(key) || null;
    }
  }

  async remove(key: string): Promise<void> {
    if (this.isBrowser()) {
      sessionStorage.removeItem(key);
    } else {
      this.memoryStorage.delete(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isBrowser()) {
      sessionStorage.clear();
    } else {
      this.memoryStorage.clear();
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
  }
}
