import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

// Placeholder interfaces that will be replaced with proper imports
interface Note {
  id: string;
  title: string;
  encryptedContent: string;
  iv: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private storageService = inject(StorageService);
  private password: string | null = null;
  private readonly PASSWORD_KEY = 'crypto_password';

  constructor() {
    // Try to load password from storage on service initialization
    this.loadPasswordFromStorage();
  }

  /**
   * Load password from storage if available
   */
  private loadPasswordFromStorage(): void {
    try {
      const storedPassword = this.storageService.get<string>(this.PASSWORD_KEY);
      if (storedPassword) {
        this.password = storedPassword;
        console.log('Crypto password loaded from storage');
      }
    } catch (error) {
      console.error('Error loading crypto password from storage:', error);
    }
  }

  /**
   * Set the user's password for encryption/decryption
   */
  setPassword(password: string): void {
    this.password = password;
    
    // Store password in storage for persistence
    try {
      this.storageService.set(this.PASSWORD_KEY, password);
      console.log('Crypto password saved to storage');
    } catch (error) {
      console.error('Error saving crypto password to storage:', error);
    }
  }

  /**
   * Clear the password
   */
  clearPassword(): void {
    this.password = null;
    try {
      this.storageService.remove(this.PASSWORD_KEY);
      console.log('Crypto password removed from storage');
    } catch (error) {
      console.error('Error removing crypto password from storage:', error);
    }
  }

  /**
   * Check if a password is set
   */
  hasPassword(): boolean {
    return this.password !== null;
  }

  /**
   * Encrypt a note
   */
  async encryptNote(plainNote: PlainNote): Promise<Note> {
    if (!this.password) {
      throw new Error('Password is not set');
    }

    try {
      // Generate random IV
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Generate random salt
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // Prepare content for encryption
      const encoder = new TextEncoder();
      const data = encoder.encode(plainNote.content);

      // Import password as key material
      const passwordData = encoder.encode(this.password);
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );

      // Derive an encryption key using PBKDF2
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      );

      // Encrypt the data
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        data
      );

      // Convert binary data to Base64 strings
      const encryptedContent = this.bufferToBase64(new Uint8Array(encryptedBuffer));
      const ivString = this.bufferToBase64(iv);
      const saltString = this.bufferToBase64(salt);

      return {
        id: plainNote.id,
        title: plainNote.title,
        encryptedContent,
        iv: ivString,
        salt: saltString,
        createdAt: plainNote.createdAt,
        updatedAt: plainNote.updatedAt
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt note');
    }
  }

  /**
   * Decrypt a note
   */
  async decryptNote(note: Note): Promise<PlainNote> {
    if (!this.password) {
      console.error('Decryption failed: No password set');
      throw new Error('Password is not set');
    }

    try {
      console.debug(`Attempting to decrypt note ${note.id}`);
      console.debug(`IV length: ${note.iv?.length || 0}, EncryptedContent length: ${note.encryptedContent?.length || 0}, Salt length: ${note.salt?.length || 0}`);
      
      // Verify necessary fields
      if (!note.encryptedContent) {
        console.error(`Missing encryptedContent for decryption of note ${note.id}`);
        throw new Error('Missing required fields for decryption');
      }
      
      if (!note.iv) {
        console.error(`Missing IV for decryption of note ${note.id}`);
        throw new Error('Missing required fields for decryption');
      }
      
      if (!note.salt) {
        console.error(`Missing salt for decryption of note ${note.id}`);
        throw new Error('Missing required fields for decryption');
      }
      
      // After individual checks, provide a clearer error message if multiple fields are missing
      const missingFields = [];
      if (!note.encryptedContent) missingFields.push('encryptedContent');
      if (!note.iv) missingFields.push('iv');
      if (!note.salt) missingFields.push('salt');
      
      if (missingFields.length > 0) {
        const errorMsg = `Missing required fields for decryption: ${missingFields.join(', ')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Convert Base64 strings back to binary
      const encryptedData = this.base64ToBuffer(note.encryptedContent);
      const iv = this.base64ToBuffer(note.iv);
      const salt = this.base64ToBuffer(note.salt);
      
      console.debug('Successfully converted Base64 data to buffers');
      console.debug(`Buffer lengths - encryptedData: ${encryptedData.length}, iv: ${iv.length}, salt: ${salt.length}`);

      // Import password as key material
      const encoder = new TextEncoder();
      const passwordData = encoder.encode(this.password);
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      console.debug('Password imported as key material');

      // Derive the key for decryption using the same salt
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      console.debug('Decryption key derived');

      // Decrypt the data
      console.debug('Attempting to decrypt data');
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        encryptedData
      );
      console.debug('Data successfully decrypted');

      // Convert the decrypted data back to text
      const decoder = new TextDecoder();
      const content = decoder.decode(decryptedBuffer);
      console.debug(`Decrypted content length: ${content.length}`);

      return {
        id: note.id,
        title: note.title,
        content,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      };
    } catch (error) {
      console.error(`Decryption error for note ${note.id}:`, error);
      throw new Error('Failed to decrypt note');
    }
  }

  /**
   * Attempt to decrypt multiple notes
   */
  async decryptNotes(notes: Note[]): Promise<PlainNote[]> {
    if (!this.password) {
      throw new Error('Password is not set');
    }

    const decryptPromises = notes.map(async (note) => {
      try {
        return await this.decryptNote(note);
      } catch (error) {
        console.error(`Failed to decrypt note ${note.id}:`, error);
        // Return a placeholder for failed decryption
        return {
          id: note.id,
          title: note.title,
          content: 'Unable to decrypt content',
          createdAt: note.createdAt,
          updatedAt: note.updatedAt
        };
      }
    });

    return Promise.all(decryptPromises);
  }

  /**
   * Convert Uint8Array to Base64 string
   */
  private bufferToBase64(buffer: Uint8Array): string {
    return btoa(String.fromCharCode.apply(null, Array.from(buffer)));
  }

  /**
   * Convert Base64 string to Uint8Array
   */
  private base64ToBuffer(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
