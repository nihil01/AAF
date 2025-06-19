import { Preferences } from '@capacitor/preferences';
import { SharedPreferences } from './SharedPreferences';

export class StorageTest {
    
    /**
     * Test basic Capacitor Preferences functionality
     */
    public static async testBasicStorage(): Promise<void> {
        try {
            console.log("=== Testing Basic Storage ===");
            
            // Test 1: Set a simple value
            const testKey = 'test_key';
            const testValue = 'test_value';
            
            await Preferences.set({
                key: testKey,
                value: testValue
            });
            console.log("✅ Test value set");
            
            // Test 2: Get the value back
            const result = await Preferences.get({ key: testKey });
            console.log("Retrieved value:", result.value);
            
            if (result.value === testValue) {
                console.log("✅ Basic storage test passed");
            } else {
                console.error("❌ Basic storage test failed");
            }
            
            // Test 3: Clean up
            await Preferences.remove({ key: testKey });
            console.log("✅ Test value cleaned up");
            
        } catch (error) {
            console.error("❌ Error in basic storage test:", error);
        }
    }
    
    /**
     * Test JSON storage (like SharedPreferences does)
     */
    public static async testJsonStorage(): Promise<void> {
        try {
            console.log("=== Testing JSON Storage ===");
            
            // Test 1: Set JSON value
            const testKey = 'json_test_key';
            const testObject = {
                id: 1,
                name: 'test',
                active: true
            };
            
            await Preferences.set({
                key: testKey,
                value: JSON.stringify(testObject)
            });
            console.log("✅ JSON value set");
            
            // Test 2: Get and parse JSON value
            const result = await Preferences.get({ key: testKey });
            const parsedValue = JSON.parse(result.value || '{}');
            console.log("Retrieved JSON:", parsedValue);
            
            if (parsedValue.id === testObject.id && parsedValue.name === testObject.name) {
                console.log("✅ JSON storage test passed");
            } else {
                console.error("❌ JSON storage test failed");
            }
            
            // Test 3: Clean up
            await Preferences.remove({ key: testKey });
            console.log("✅ JSON test value cleaned up");
            
        } catch (error) {
            console.error("❌ Error in JSON storage test:", error);
        }
    }
    
    /**
     * Test SharedPreferences methods directly
     */
    public static async testSharedPreferences(): Promise<void> {
        try {
            console.log("=== Testing SharedPreferences ===");
            
            // Test 1: Set user data
            const testUser = {
                id: 999,
                username: 'testuser',
                email: 'test@example.com',
                registered: new Date().toISOString(),
                success: true
            };
            
            await SharedPreferences.addUserData(testUser);
            console.log("✅ Test user data set");
            
            // Test 2: Get user data
            const retrievedUser = await SharedPreferences.getUserData();
            console.log("Retrieved user data:", retrievedUser);
            
            if (retrievedUser && retrievedUser.id === testUser.id) {
                console.log("✅ SharedPreferences test passed");
            } else {
                console.error("❌ SharedPreferences test failed");
            }
            
            // Test 3: Clean up
            await SharedPreferences.clearAll();
            console.log("✅ SharedPreferences test cleaned up");
            
        } catch (error) {
            console.error("❌ Error in SharedPreferences test:", error);
        }
    }
    
    /**
     * Run all storage tests
     */
    public static async runAllTests(): Promise<void> {
        console.log("🚀 Running all storage tests...");
        
        await this.testBasicStorage();
        await this.testJsonStorage();
        await this.testSharedPreferences();
        
        console.log("🏁 All storage tests completed");
    }
} 