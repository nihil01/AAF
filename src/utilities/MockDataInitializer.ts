import { SharedPreferences } from './SharedPreferences';
import type { UserResponse } from '../net/UserResponse';

export class MockDataInitializer {
    
    private static mockUsers: UserResponse[] = [
        {
            id: 1,
            username: "orxan",
            email: "orxan@test.com",
            registered: new Date().toISOString(),
            success: true
        },
        {
            id: 2,
            username: "elman",
            email: "elman@test.com",
            registered: new Date().toISOString(),
            success: true
        },
        {
            id: 3,
            username: "testuser",
            email: "test@example.com",
            registered: new Date().toISOString(),
            success: true
        }
    ];

    public static async initializeMockUser(): Promise<UserResponse | null> {
        try {
            // Check if user data already exists
            const existingUser = await SharedPreferences.getUserData();
            if (existingUser) {
                console.log("User data already exists:", existingUser);
                return existingUser;
            }

            // Show user selection prompt
            const userChoice = prompt("Choose a test user (0-2):\n0: orxan (ID: 1)\n1: elman (ID: 2)\n2: testuser (ID: 3)");
            
            if (userChoice === null) {
                console.log("User cancelled mock data initialization");
                return null;
            }

            const userIndex = parseInt(userChoice);
            if (isNaN(userIndex) || userIndex < 0 || userIndex >= this.mockUsers.length) {
                alert("Invalid choice. Please select 0, 1, or 2.");
                return null;
            }

            const selectedUser = this.mockUsers[userIndex];
            console.log("Selected mock user:", selectedUser);

            // Save the user data
            await SharedPreferences.addUserData(selectedUser);
            
            // Set a mock token to indicate user is logged in
            await SharedPreferences.setToken('refresh', `mock_refresh_token_${selectedUser.id}`);
            await SharedPreferences.setToken('access', `mock_access_token_${selectedUser.id}`);

            alert(`Mock user initialized: ${selectedUser.username} (ID: ${selectedUser.id})`);
            return selectedUser;

        } catch (error) {
            console.error("Error initializing mock user:", error);
            return null;
        }
    }

    public static async forceReinitializeMockUser(): Promise<UserResponse | null> {
        try {
            // Clear existing data
            await SharedPreferences.clearAll();
            
            // Initialize new mock user
            return await this.initializeMockUser();
        } catch (error) {
            console.error("Error reinitializing mock user:", error);
            return null;
        }
    }

    public static getMockUsers(): UserResponse[] {
        return [...this.mockUsers];
    }

    public static async clearMockData(): Promise<void> {
        await SharedPreferences.clearAll();
        console.log("Mock data cleared");
    }
} 