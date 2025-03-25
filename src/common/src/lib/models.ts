/**
 * Models for the cfNote application
 */

/**
 * Note model
 * Represents an encrypted note
 */
export interface Note {
  id: string;
  title: string;
  content?: string;
  encryptedContent: string;
  iv: string;
  salt: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Plain note model (decrypted)
 * Used for displaying notes in the UI
 */
export interface PlainNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User model
 * Represents a user identified by their hash
 */
export interface User {
  emailHash: string;
  authHash: string;
}

/**
 * API response for notes
 */
export interface NotesResponse {
  notes: Note[];
}

/**
 * API response for authentication
 */
export interface AuthResponse {
  status: string;
  authenticated: boolean;
  isNewUser: boolean;
}

/**
 * Theme options
 */
export enum Theme {
  LIGHT = 'light-theme',
  DARK = 'dark-theme',
  SEPIA = 'sepia-theme',
}
