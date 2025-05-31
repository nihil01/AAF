import { Preferences } from '@capacitor/preferences';
import type {UserResponse} from "../net/UserResponse.ts";

export class SharedPreferences {

    //TOKENS
    public static async setToken( type: 'access' | 'refresh', value: string): Promise<void> {
        await Preferences.set({
            key: `${type}_token`,
            value: JSON.stringify(value)
        });
    }

    public static async getToken(type: 'access' | 'refresh'): Promise<string | null> {
        const token = await Preferences.get({ key: `${type}_token` }).then(result => result.value);
        if (!token) return null;

        try {
            return JSON.parse(token);
        } catch (e) {
            return null;
        }
    }

    public static async removeToken(type: 'access' | 'refresh'): Promise<void> {
        await Preferences.remove({ key: `${type}_token` });
    }


    //USER
    public static async addUserData(data: UserResponse): Promise<void>{
        await Preferences.set({
            key: 'user',
            value: JSON.stringify(data)
        });
    }

    public static async getUserData(): Promise<UserResponse | null> {
        const userData = await Preferences.get({ key: 'user' }).then(result => result.value);
        if (!userData) return null;

        try {
            return JSON.parse(userData);
        } catch (e) {
            return null;
        }
    }

}