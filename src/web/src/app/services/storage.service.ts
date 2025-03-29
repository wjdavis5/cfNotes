import { Injectable } from '@angular/core';

/**
 * Storage types enum
 */
export enum StorageType {
  LOCAL = 'local',
  SESSION = 'session'
}

/**
 * Service for handling browser storage operations
 * Supports both localStorage and sessionStorage
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Store data in storage
   * @param key Key to store data under
   * @param value Value to store
   * @param storageType Type of storage to use (defaults to sessionStorage for better security)
   */
  set<T>(key: string, value: T, storageType: StorageType = StorageType.SESSION): void {
    try {
      const serializedValue = JSON.stringify(value);
      if (storageType === StorageType.SESSION) {
        sessionStorage.setItem(key, serializedValue);
      } else {
        localStorage.setItem(key, serializedValue);
      }
    } catch (error) {
      console.error(`Error saving to ${storageType}Storage:`, error);
    }
  }

  /**
   * Retrieve data from storage
   * @param key Key to retrieve
   * @param storageType Type of storage to check (will check sessionStorage first, then localStorage if not found)
   */
  get<T>(key: string, storageType?: StorageType): T | null {
    try {
      let serializedValue: string | null = null;

      if (!storageType) {
        // If no storage type specified, check session storage first, then local
        serializedValue = sessionStorage.getItem(key);
        if (serializedValue === null) {
          serializedValue = localStorage.getItem(key);
        }
      } else if (storageType === StorageType.SESSION) {
        serializedValue = sessionStorage.getItem(key);
      } else {
        serializedValue = localStorage.getItem(key);
      }

      if (serializedValue === null) {
        return null;
      }
      return JSON.parse(serializedValue) as T;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  /**
   * Remove data from storage
   * @param key Key to remove
   * @param storageType Type of storage to remove from (defaults to both)
   */
  remove(key: string, storageType?: StorageType): void {
    try {
      if (!storageType || storageType === StorageType.SESSION) {
        sessionStorage.removeItem(key);
      }
      if (!storageType || storageType === StorageType.LOCAL) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  /**
   * Clear all app data from storage
   * @param storageType Type of storage to clear (defaults to both)
   */
  clear(storageType?: StorageType): void {
    try {
      if (!storageType || storageType === StorageType.SESSION) {
        sessionStorage.clear();
      }
      if (!storageType || storageType === StorageType.LOCAL) {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}
