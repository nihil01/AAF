// 📦 utils/crypto.ts

// Генерация RSA ключей (для пользователя)
export async function generateRSAKeyPair() {
    return window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  // Сериализация ключей
  export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }
  
  export async function exportPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey("pkcs8", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }
  
  export async function importPublicKey(pem: string): Promise<CryptoKey> {
    const binary = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
    return window.crypto.subtle.importKey(
      "spki",
      binary,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );
  }
  
  export async function importPrivateKey(pem: string): Promise<CryptoKey> {
    const binary = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
    return window.crypto.subtle.importKey(
      "pkcs8",
      binary,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
  }
  
  // AES ключ и IV
  export async function generateAESKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  }
  
  export function generateIV(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(12));
  }
  
  // Шифрование текста AES
  export async function aesEncrypt(
    key: CryptoKey,
    iv: Uint8Array,
    data: string
  ): Promise<string> {
    const encoded = new TextEncoder().encode(data);
    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encoded
    );
    return btoa(String.fromCharCode(...new Uint8Array(ciphertext)));
  }
  
  // Расшифровка AES
  export async function aesDecrypt(
    key: CryptoKey,
    iv: Uint8Array,
    data: string
  ): Promise<string> {
    const binary = Uint8Array.from(atob(data), c => c.charCodeAt(0));
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      binary
    );
    return new TextDecoder().decode(decrypted);
  }
  
  // Шифруем AES ключ RSA ключом получателя
  export async function rsaEncryptAESKey(
    publicKey: CryptoKey,
    aesKey: CryptoKey
  ): Promise<string> {
    const rawKey = await window.crypto.subtle.exportKey("raw", aesKey);
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      rawKey
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }
  
  // Расшифровываем AES ключ RSA приватным ключом
  export async function rsaDecryptAESKey(
    privateKey: CryptoKey,
    encryptedKey: string
  ): Promise<CryptoKey> {
    const binary = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
    const rawKey = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      binary
    );
    return window.crypto.subtle.importKey(
      "raw",
      rawKey,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  }
  