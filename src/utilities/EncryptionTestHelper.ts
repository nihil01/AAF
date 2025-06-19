import { 
  generateAndPublishKeyBundle, 
  fetchRemoteKeyBundle, 
  encryptMessage, 
  decryptMessage,
  testSignalProtocol,
  hasLocalKeyData,
  clearLocalKeyData
} from './Crypto';

export class EncryptionTestHelper {
  
  // Test basic Signal Protocol functionality
  static async testSignalProtocol(): Promise<void> {
    console.log('🧪 Testing Signal Protocol...');
    await testSignalProtocol();
  }

  // Test key generation and publishing
  static async testKeyGeneration(userId: string): Promise<void> {
    console.log('🔑 Testing key generation for user:', userId);
    try {
      const bundle = await generateAndPublishKeyBundle(userId);
      console.log('✅ Key bundle generated and published:', bundle);
    } catch (error) {
      console.error('❌ Key generation failed:', error);
    }
  }

  // Test fetching remote key bundle
  static async testFetchRemoteKeys(remoteUserId: string): Promise<void> {
    console.log('📥 Testing remote key fetch for user:', remoteUserId);
    try {
      const bundle = await fetchRemoteKeyBundle(remoteUserId);
      console.log('✅ Remote key bundle fetched:', bundle);
    } catch (error) {
      console.error('❌ Remote key fetch failed:', error);
    }
  }

  // Test end-to-end encryption
  static async testEndToEndEncryption(user1Id: string, user2Id: string, testMessage: string): Promise<void> {
    console.log('🔐 Testing end-to-end encryption...');
    console.log('User 1:', user1Id);
    console.log('User 2:', user2Id);
    console.log('Test message:', testMessage);

    try {
      // Generate keys for both users
      console.log('Generating keys for user 1...');
      await generateAndPublishKeyBundle(user1Id);
      
      console.log('Generating keys for user 2...');
      await generateAndPublishKeyBundle(user2Id);

      // Fetch remote keys
      console.log('Fetching user 2 keys for user 1...');
      const user2Bundle = await fetchRemoteKeyBundle(user2Id);

      // Encrypt message from user 1 to user 2
      console.log('Encrypting message from user 1 to user 2...');
      const encrypted = await encryptMessage(user2Bundle, user2Id, testMessage);
      console.log('Encrypted data length:', encrypted.length);

      // Decrypt message as user 2
      console.log('Decrypting message as user 2...');
      const decrypted = await decryptMessage(user1Id, encrypted);
      console.log('Decrypted message:', decrypted);

      // Verify
      if (decrypted === testMessage) {
        console.log('✅ End-to-end encryption test PASSED!');
      } else {
        console.log('❌ End-to-end encryption test FAILED!');
        console.log('Expected:', testMessage);
        console.log('Got:', decrypted);
      }

    } catch (error) {
      console.error('❌ End-to-end encryption test failed:', error);
    }
  }

  // Test message encryption/decryption
  static async testMessageEncryption(message: string): Promise<void> {
    console.log('💬 Testing message encryption...');
    console.log('Original message:', message);

    try {
      // Generate test keys
      const testUserId = 'test_user_' + Date.now();
      await generateAndPublishKeyBundle(testUserId);
      const bundle = await fetchRemoteKeyBundle(testUserId);

      // Encrypt
      const encrypted = await encryptMessage(bundle, testUserId, message);
      console.log('Encrypted data:', encrypted);
      console.log('Encrypted length:', encrypted.length);

      // Decrypt
      const decrypted = await decryptMessage(testUserId, encrypted);
      console.log('Decrypted message:', decrypted);

      // Verify
      if (decrypted === message) {
        console.log('✅ Message encryption test PASSED!');
      } else {
        console.log('❌ Message encryption test FAILED!');
      }

    } catch (error) {
      console.error('❌ Message encryption test failed:', error);
    }
  }

  // Check encryption status
  static async checkEncryptionStatus(): Promise<void> {
    console.log('🔍 Checking encryption status...');
    
    const hasKeys = await hasLocalKeyData();
    console.log('Local keys available:', hasKeys);
    
    if (hasKeys) {
      const keyData = await import('./Crypto').then(m => m.getLocalKeyData());
      console.log('Key data:', keyData);
    }
  }

  // Clear all encryption data
  static async clearEncryptionData(): Promise<void> {
    console.log('🗑️ Clearing encryption data...');
    await clearLocalKeyData();
    console.log('✅ Encryption data cleared');
  }

  // Run all tests
  static async runAllTests(): Promise<void> {
    console.log('🚀 Running all encryption tests...');
    
    await this.testSignalProtocol();
    await this.checkEncryptionStatus();
    await this.testMessageEncryption('Hello, this is a test message!');
    
    console.log('🎉 All tests completed!');
  }

  // Test with mock users
  static async testWithMockUsers(): Promise<void> {
    console.log('👥 Testing with mock users...');
    
    const user1Id = 'mock_user_1';
    const user2Id = 'mock_user_2';
    const testMessage = 'Hello from mock user 1!';
    
    await this.testEndToEndEncryption(user1Id, user2Id, testMessage);
  }
}

// Make it available globally for testing
declare global {
  interface Window {
    EncryptionTestHelper: typeof EncryptionTestHelper;
  }
}

// Expose to window for console testing
if (typeof window !== 'undefined') {
  window.EncryptionTestHelper = EncryptionTestHelper;
} 