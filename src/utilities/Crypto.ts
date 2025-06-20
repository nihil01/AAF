// 📦 utils/crypto.ts
import type { Message } from '../components/chat/ChatComponent';
import type { MessageDTO } from '../net/SocketIO';
import { SharedPreferences } from './SharedPreferences';

// Генерация RSA ключей (для пользователя)
async function generateRSAKeyPair() {
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

  export async function initializeRSAKeyPair(userId: number): Promise<{
    publicKey: string;
    privateKey: string;
    success: boolean;
    alreadyExists: boolean;
  }> {
    try {
      // 1. Check if keys already exist
      const [privateKey, publicKey] = await Promise.all([
        getPrivateKeyFromStorage(), 
        getPublicKeyFromStorage()
      ]);
      
      if (privateKey && publicKey) {
        // 2. Validate existing keys
        const areKeysValid = await validateExistingKeys();
        
        if (areKeysValid) {
          console.log('✅ Keys already initialized and valid');
          return {
            publicKey: publicKey,
            privateKey: privateKey,
            success: true,
            alreadyExists: true
          };
        } else {
          console.log('⚠️ Existing keys are invalid, regenerating...');
          // Clear invalid keys
          await Promise.all([
            SharedPreferences.set('private_key', ''),
            SharedPreferences.set('public_key', '')
          ]);
        }
      }

      // 3. Generate new RSA key pair
      console.log('🔑 Generating new RSA key pair...');
      const keyPair = await generateRSAKeyPair();
              
      // 4. Export keys to string format
      const publicKeyString = await exportPublicKey(keyPair.publicKey);
      const privateKeyString = await exportPrivateKey(keyPair.privateKey);

      // 5. Save private key to shared preferences
      await SharedPreferences.set('private_key', privateKeyString);
      console.log('✅ Private key saved to shared preferences');

      const token = await SharedPreferences.get('access_token');

      // 6. Send public key to backend
      const response = await fetch(`http://10.20.30.2:8080/api/v1/keys/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          publicKey: publicKeyString
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save public key to backend: ${response.status}`);
      }

      console.log('✅ Public key sent to backend successfully');
      await SharedPreferences.set('public_key', publicKeyString);

      return {
        publicKey: publicKeyString,
        privateKey: privateKeyString,
        success: true,
        alreadyExists: false
      };
    } catch (error) {
      console.error('❌ Error initializing RSA key pair:', error);
      throw error;
    }
  }
  

  // Helper function to get private key from shared preferences
  async function getPrivateKeyFromStorage(): Promise<string | null> {
    return await SharedPreferences.get('private_key');
  }

  async function getPublicKeyFromStorage(): Promise<string | null> {
    return await SharedPreferences.get('public_key');
  }

  // Helper function to check if user has initialized keys
  export async function hasInitializedKeys(): Promise<boolean> {
    const [privateKey, publicKey] = await Promise.all([
      getPrivateKeyFromStorage(),
      getPublicKeyFromStorage()
    ]);
    return privateKey !== null && publicKey !== null;
  }

  // Helper function to validate existing keys
  export async function validateExistingKeys(): Promise<boolean> {
    try {
      const [privateKey, publicKey] = await Promise.all([
        getPrivateKeyFromStorage(),
        getPublicKeyFromStorage()
      ]);
      
      if (!privateKey || !publicKey) {
        return false;
      }

      // Try to import both keys to validate them
      await importPrivateKey(privateKey);
      await importPublicKey(publicKey);
      
      console.log('✅ Existing keys are valid');
      return true;
    } catch (error) {
      console.error('❌ Existing keys are invalid:', error);
      return false;
    }
  }

  // Helper function to clear private key from storage (for logout/security)
  export async function clearPrivateKeyFromStorage(): Promise<void> {
    await SharedPreferences.set('private_key', '');
    console.log('✅ Private key cleared from storage');
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

  export async function getPeerPublicKey(userId: string) {
    // 1. Получаем публичный ключ получателя (с твоего backend API или сокетом)
    const token = await SharedPreferences.get('access_token');
    const response = await fetch(`http://10.20.30.2:8080/api/v1/keys/fetch/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const { publicKey: publicKeyPem } = await response.json();
    console.log("Public key fetched:", publicKeyPem);
    if (publicKeyPem) {
      return await importPublicKey(publicKeyPem);
    }
    return null;
  }

  export const getCryptoKeyAsString = async (cryptoKey: CryptoKey, isPrivate: boolean = false): Promise<string> => {
    try {
      if (isPrivate) {
        return await exportPrivateKey(cryptoKey);
      } else {
        return await exportPublicKey(cryptoKey);
      }
    } catch (error) {
      console.error('Error exporting key to string:', error);
      throw error;
    }
  };

  export async function sendEncryptedMessage(dto: Message, publicKey: CryptoKey): Promise<MessageDTO> {
    try {
      console.log("🔐 Starting sendEncryptedMessage...");
      console.log("DTO:", dto);
      console.log("Public Key:", publicKey);
      
      // Validate inputs
      if (!dto || !dto.message) {
        throw new Error("Invalid DTO or message");
      }
      
      if (!publicKey) {
        throw new Error("Public key is required");
      }
      
      // 1. Generate AES key and IV
      console.log("🔑 Generating AES key...");
      const aesKey = await generateAESKey();
      console.log("✅ AES key generated");
      
      console.log("🔢 Generating IV...");
      const iv = generateIV();
      console.log("✅ IV generated:", iv);
    
      // 2. Encrypt the message with AES key
      console.log("🔒 Encrypting message with AES...");
      const ciphertext = await aesEncrypt(aesKey, iv, dto.message);
      console.log("✅ Message encrypted, ciphertext length:", ciphertext.length);
      
      // 3. Encrypt AES key with RSA public key
      console.log("🔐 Encrypting AES key with RSA...");
      const encryptedAESKey = await rsaEncryptAESKey(publicKey, aesKey);
      console.log("✅ AES key encrypted, length:", encryptedAESKey.length);

      // 4. Create the encrypted message DTO
      const encryptedDTO: MessageDTO = {
        to: dto.to,
        from: dto.from,
        message: ciphertext,
        type: dto.type ?? "PRIVATE_MESSAGE",
        room: dto.room ?? "",
        timestamp: Date.now(),
        iv: Array.from(iv),
        encryptedAESKey: encryptedAESKey,
      };
      
      console.log("✅ Encrypted DTO created:", encryptedDTO);
      return encryptedDTO;
      
    } catch (error) {
      console.error("❌ Error in sendEncryptedMessage:", error);
      throw error;
    }
  }

  export async function receiveEncryptedMessage(
    encryptedData: MessageDTO
  ): Promise<string> {
    try {
      // 1. Get private key from shared preferences
      const privateKeyPem = await getPrivateKeyFromStorage();
      if (!privateKeyPem) {
        throw new Error('Private key not found in storage. Please initialize keys first.');
      }
      
      // 2. Import the private RSA key
      const privateKey = await importPrivateKey(privateKeyPem);
    
      // 3. Decrypt the AES key
      const aesKey = await rsaDecryptAESKey(privateKey, encryptedData.encryptedAESKey);
    
      // 4. Decrypt the message
      const decryptedMessage = await aesDecrypt(
        aesKey,
        new Uint8Array(encryptedData.iv),
        encryptedData.message
      );
    
      return decryptedMessage;
    } catch (error) {
      console.error('❌ Error decrypting message:', error);
      throw error;
    }
  }