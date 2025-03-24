/**
 * Crypto utility functions for client-side encryption/decryption of notes
 * Uses AES-GCM encryption algorithm which is a modern, secure algorithm
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256; // bits
const SALT_LENGTH = 16; // bytes
const IV_LENGTH = 12; // bytes
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Generate a cryptographic key from a password
 * @param password User's password
 * @param salt Salt for key derivation (if not provided, a new one is generated)
 * @returns Object containing the derived key and salt
 */
export async function deriveKey(password: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  // Generate salt if not provided
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  }

  // Convert password to key material
  const passwordEncoder = new TextEncoder();
  const passwordBuffer = passwordEncoder.encode(password);

  // Derive key using PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // Derive the actual encryption key
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );

  return { key, salt };
}

/**
 * Encrypt text using AES-GCM
 * @param text Text to encrypt
 * @param password User's password
 * @returns Object containing encrypted data, IV (initialization vector), and salt
 */
export async function encrypt(text: string, password: string): Promise<{ encryptedData: string; iv: string; salt: string }> {
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key from password
  const { key, salt } = await deriveKey(password);

  // Encode the text
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(text);

  // Encrypt the data
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    data
  );

  // Convert binary data to Base64 strings for storage
  const encryptedData = bufferToBase64(new Uint8Array(encryptedBuffer));
  const ivString = bufferToBase64(iv);
  const saltString = bufferToBase64(salt);

  return {
    encryptedData,
    iv: ivString,
    salt: saltString,
  };
}

/**
 * Decrypt encrypted text
 * @param encryptedData Base64-encoded encrypted data
 * @param iv Base64-encoded initialization vector
 * @param salt Base64-encoded salt used for key derivation
 * @param password User's password
 * @returns Decrypted text
 */
export async function decrypt(encryptedData: string, iv: string, salt: string, password: string): Promise<string> {
  // Convert Base64 strings back to binary data
  const encryptedBuffer = base64ToBuffer(encryptedData);
  const ivBuffer = base64ToBuffer(iv);
  const saltBuffer = base64ToBuffer(salt);

  // Derive key using the same salt
  const { key } = await deriveKey(password, saltBuffer);

  // Decrypt the data
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv: ivBuffer,
    },
    key,
    encryptedBuffer
  );

  // Decode the decrypted data back to text
  const textDecoder = new TextDecoder();
  return textDecoder.decode(decryptedBuffer);
}

/**
 * Generate a hash from email and password for user identification
 * @param email User's email
 * @param password User's password
 * @returns Hash string
 */
export async function generateUserHash(email: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${email.toLowerCase()}:${password}`);

  // Use SHA-256 for hashing
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToBase64(new Uint8Array(hashBuffer));
}

/**
 * Convert Uint8Array to Base64 string
 * @param buffer Binary data
 * @returns Base64-encoded string
 */
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode.apply(null, Array.from(buffer)));
}

/**
 * Convert Base64 string to Uint8Array
 * @param base64 Base64-encoded string
 * @returns Binary data
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
