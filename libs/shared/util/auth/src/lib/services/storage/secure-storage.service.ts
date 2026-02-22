import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  async set(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await SecureStoragePlugin.set({ key, value });
      } catch (error) {
        console.error('SecureStorage set error', error);
      }
    } else {
      const encoded = btoa(value);
      sessionStorage.setItem(key, encoded);
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
      const encoded = sessionStorage.getItem(key);
      if (!encoded) return null;
      try {
        return atob(encoded);
      } catch {
        return null;
      }
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
      sessionStorage.removeItem(key);
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
      sessionStorage.clear();
    }
  }
}
