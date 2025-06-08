import type {AuthUser} from "./AuthUser.ts";
import type {UserResponse} from "./UserResponse.ts";
import {SharedPreferences} from "../utilities/SharedPreferences.ts";
import type {AvailableUser, FriendsStruct} from "./FriendsStruct.ts";
import type {UserCords} from "./AppStateConnection.ts";

export interface Vehicle {
    uuid: string;
    id: number;
    make: string;
    model: string;
    year: number;
    engineSpecs: string;
    horsePower: number;
    torque: string;
    zeroToHundred: string;
    story: string;
    modifications?: string;
}

export interface VehicleWithMedia extends Vehicle {
    created_at: string;
    photo_urls: string[];
}

export class HttpClient {

    private AUTH_BASE_URL = 'http://10.20.30.3:8080/api/v1/auth';
    private FRIENDS_BASE_URL = 'http://10.20.30.3:8080/api/v1/friends';
    private FIREBASE_BASE_URL = 'http://10.20.30.3:8080/api/v1/firebase';
    private SILENT_PUSH_BASE_URL = 'http://10.20.30.3:8080/api/v1/silent';
    private CARS_BASE_URL = 'http://10.20.30.3:8080/api/v1/vehicles';


 //AUTHENTICATION
    public async authenticate(user: AuthUser): Promise<UserResponse> {
        const formData = new URLSearchParams();

        for (const [key, value] of Object.entries(user)) {
            formData.append(key, value);
        }

        let request = new Request(`${this.AUTH_BASE_URL}/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        let response = await fetch(request);

        console.log("Response awaiting!!!")

        if (!response.ok) {
            // response = await this.handleResponse(response, request);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(response.status)
        console.log(response.headers)

        if (response.status === 200) {
            const accessToken = response.headers.get('authorization');
            const refreshToken = response.headers.get('refresh-token');

            console.log(accessToken, refreshToken)

            if (accessToken && refreshToken) {
                await SharedPreferences.setToken('access', accessToken.slice("bearer".length).trim());
                await SharedPreferences.setToken('refresh', refreshToken.slice("bearer".length).trim());
            }

            const userData: UserResponse = await response.json();
            await SharedPreferences.addUserData(userData);
            return userData;
        }

        return await response.json() as UserResponse;
    }


    //USER RECOVERY
    public async requestPasswordRecovery(email: string): Promise<{ "success": boolean }> {
        let data = await fetch(`${this.AUTH_BASE_URL}/forgot-password?email=${email}`);
        return await data.json();
    }

    public async recoverPassword(email: string, code: string, password: string): Promise<Record<string, boolean>> {
        const response = await fetch(`${this.AUTH_BASE_URL}/password-recovery`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email, code, password
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }


    //FRIENDS
    public async addFriend(friendEmail: string): Promise<string> {
        const accessToken = await SharedPreferences.getToken('access');

        const request = new Request(`${this.FRIENDS_BASE_URL}/addFriend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                "email": friendEmail
            })
        });

        const response = await fetch(request);

        return (await (this.handleResponse(response, request))).text();
    }

    public async manageFriend(friendName: string, state: "accept" | "reject"): Promise<string> {
        const accessToken = await SharedPreferences.getToken('access');

        const response = await fetch(
            `${this.FRIENDS_BASE_URL}/manageFriend?friendName=${friendName}&action=${state}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return await response.text();
    }


    public async removeFriend(friendName: string): Promise<string> {
        const accessToken = await SharedPreferences.getToken('access');

        const response = await fetch(`${this.FRIENDS_BASE_URL}/removeFriend?friendName=${friendName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return await response.text();
    }


    public async getFriends(): Promise<FriendsStruct> {
        const accessToken = await SharedPreferences.getToken('access');

        const request = new Request(`${this.FRIENDS_BASE_URL}/getFriends`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log("Fetching ...")

        let response = await fetch(request);

        response = await this.handleResponse(response, request);

        console.log(response)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    public async getUsersByName(name: string): Promise<AvailableUser[]> {
        const accessToken = await SharedPreferences.getToken('access');

        const request = new Request(`${this.FRIENDS_BASE_URL}/getUsersByName?name=${name}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        let response = await fetch(request);

        response = await this.handleResponse(response, request);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }


    //FIREBASE
    public async sendFirebaseToken(token: string, deviceInfo: string): Promise<string> {
        const accessToken = await SharedPreferences.getToken('access');

        const request = new Request(`${this.FIREBASE_BASE_URL}/sendToken`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:`Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                "token": token,
                "deviceID": deviceInfo
            }),
        });

        let response = await fetch(request);

        response = await this.handleResponse(response, request);

        return await response.text();
    }

    //SILENT PUSH CONTROLLER / AKA NON-ACTIVE APP STATE
    public async silentPush(cords: UserCords): Promise<void> {
        const accessToken = await SharedPreferences.getToken('access');

        const request = new Request(`${this.SILENT_PUSH_BASE_URL}/push`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(cords)
        });

        let response = await fetch(request);

        response = await this.handleResponse(response, request);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    }

    public async getNearbyUsers(latitude: number, longitude: number): Promise<Response>{
        const accessToken = await SharedPreferences.getToken('access');

        const request = new Request(`${this.SILENT_PUSH_BASE_URL}/nearby?lat=${latitude}&lon=${longitude}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        let response = await fetch(request);

        return await this.handleResponse(response, request);
    }


    //UTILITY METHODS
    private async handleResponse(response: Response, request: Request): Promise<Response> {
        if (response.status === 401) {
            console.log("Trying to handle ...")
            await this.refreshToken();
            const accessToken = await SharedPreferences.getToken('access');
            
            // Create new request with the same properties
            const newRequest = new Request(request.url, {
                method: request.method,
                headers: {
                    ...Object.fromEntries(request.headers),
                    'Authorization': `Bearer ${accessToken}`
                },
                // For FormData, we need to use the original request's body
                body: request.body
            });

            // If the original request was a FormData, we need to ensure it's still valid
            if (request.body instanceof FormData) {
                // The FormData is still valid as it's a reference to the original
                return await fetch(newRequest);
            }

            return await fetch(newRequest);
        }
        return response;
    }


    private async refreshToken(): Promise<void> {
        const refreshToken = await SharedPreferences.getToken('refresh');

        if (!refreshToken) {
            throw new Error('No refresh token found');
        }

        const response = await fetch(`${this.AUTH_BASE_URL}/refresh`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });

        if (!response.ok) {
            await SharedPreferences.removeToken("access");
            await SharedPreferences.removeToken("refresh");
            location.href = "/";
        } else {
            const newAccessToken = response.headers.get('authorization');

            if (newAccessToken) {
                await SharedPreferences.setToken('access', newAccessToken.slice("bearer".length).trim());
            }
        }
    }

    async submitVehicleData(formData: FormData): Promise<VehicleWithMedia> {
        try {
            const accessToken = await SharedPreferences.getToken('access');
            
            const request = new Request(`${this.CARS_BASE_URL}/submitVehicleData`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            const response = await this.handleResponse(await fetch(request), request);

            if (!response.ok) {
                throw new Error('Failed to submit car data');
            }

            const data = await response.json();
            return data as VehicleWithMedia;

        } catch (error) {
            console.error('Error in submitCarData:', error);
            throw error;
        }
    }

    async getVehicleData(): Promise<VehicleWithMedia[]> {
        try {
            const accessToken = await SharedPreferences.getToken('access');
            
            const request = new Request(`${this.CARS_BASE_URL}/getVehicleData`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            const response = await this.handleResponse(await fetch(request), request);

            if (!response.ok) {
                throw new Error('Failed to fetch vehicle data');
            }

            const data = await response.json();
            return data as VehicleWithMedia[];

        } catch (error) {
            console.error('Error in getVehicleData:', error);
            throw error;
        }
    }

    async deleteVehicle(vehicleUUID: string): Promise<void> {
        try {
            const accessToken = await SharedPreferences.getToken('access');
            
            const request = new Request(`${this.CARS_BASE_URL}/deleteVehicle/${vehicleUUID}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
            });

            const response = await this.handleResponse(await fetch(request), request);

            if (!response.ok) {
                throw new Error('Failed to delete vehicle');
            }
        } catch (error) {
            console.error('Error in deleteVehicle:', error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        const refreshToken = await SharedPreferences.getToken('refresh');
        await fetch(`${this.AUTH_BASE_URL}/logout`, {
            headers: {
                'Authorization': `Bearer ${refreshToken}`
            }
        });

        await SharedPreferences.clearAll();
    }
}