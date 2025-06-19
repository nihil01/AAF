import { SharedPreferences } from './SharedPreferences';
import { MockDataInitializer } from './MockDataInitializer';
import type { UserResponse } from '../net/UserResponse';

export class UserDataDebugger {
    
    /**
     * Test if user data can be saved and retrieved properly
     */
    public static async testUserDataStorage(): Promise<void> {
        try {
            console.log("=== Testing User Data Storage ===");
            
            // Test 1: Check if any user data exists
            const existingData = await SharedPreferences.getUserData();
            console.log("Existing user data:", existingData);
            
            if (existingData) {
                console.log("✅ User data already exists");
                return;
            }
            
            // Test 2: Initialize mock user
            console.log("No existing data found, initializing mock user...");
            const mockUser = await MockDataInitializer.initializeMockUser();
            
            if (!mockUser) {
                console.error("❌ Failed to initialize mock user");
                return;
            }
            
            console.log("✅ Mock user initialized:", mockUser);
            
            // Test 3: Verify data was saved
            const retrievedData = await SharedPreferences.getUserData();
            console.log("Retrieved user data:", retrievedData);
            
            if (retrievedData && retrievedData.id === mockUser.id) {
                console.log("✅ User data storage test passed");
            } else {
                console.error("❌ User data storage test failed");
            }
            
        } catch (error) {
            console.error("❌ Error testing user data storage:", error);
        }
    }
    
    /**
     * Clear all data and reinitialize for testing
     */
    public static async resetAndTest(): Promise<void> {
        try {
            console.log("=== Resetting and Testing User Data ===");
            
            // Clear all data
            await SharedPreferences.clearAll();
            console.log("✅ All data cleared");
            
            // Test storage
            await this.testUserDataStorage();
            
        } catch (error) {
            console.error("❌ Error in reset and test:", error);
        }
    }
    
    /**
     * Get detailed information about current user data state
     */
    public static async getDetailedUserInfo(): Promise<string> {
        try {
            const userData = await SharedPreferences.getUserData();
            const refreshToken = await SharedPreferences.getToken('refresh');
            const accessToken = await SharedPreferences.getToken('access');
            
            const info = {
                userData: userData,
                refreshToken: refreshToken ? 'Present' : 'Missing',
                accessToken: accessToken ? 'Present' : 'Missing',
                timestamp: new Date().toISOString()
            };
            
            console.log("Detailed user info:", info);
            return JSON.stringify(info, null, 2);
            
        } catch (error) {
            return `Error getting user info: ${error}`;
        }
    }
    
    /**
     * Force initialize a specific user for testing
     */
    public static async forceInitializeUser(userIndex: number): Promise<UserResponse | null> {
        try {
            console.log(`=== Force Initializing User ${userIndex} ===`);
            
            // Clear existing data
            await SharedPreferences.clearAll();
            
            // Get mock users
            const mockUsers = MockDataInitializer.getMockUsers();
            if (userIndex < 0 || userIndex >= mockUsers.length) {
                console.error("Invalid user index:", userIndex);
                return null;
            }
            
            const selectedUser = mockUsers[userIndex];
            
            // Save user data
            await SharedPreferences.addUserData(selectedUser);
            await SharedPreferences.setToken('refresh', `mock_refresh_token_${selectedUser.id}`);
            await SharedPreferences.setToken('access', `mock_access_token_${selectedUser.id}`);
            
            console.log("✅ User force initialized:", selectedUser);
            return selectedUser;
            
        } catch (error) {
            console.error("❌ Error force initializing user:", error);
            return null;
        }
    }
} 