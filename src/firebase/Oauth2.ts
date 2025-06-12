import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { HttpClient } from "../net/HttpClient";

export const loginWithGoogle = async (onError?: (msg?: string) => void) => {
    try {
        const result = await FirebaseAuthentication.signInWithGoogle({
            scopes: ['email', 'profile'],
        });
        console.log('✅ USER:', result.user);

        const token = result.credential?.idToken;

        console.log("Token is " + token);

        new HttpClient().authenticate({
            type: "google_oauth",
            idToken: token,
            password: "",
            email: result.user?.email || "",
            username: result.user?.displayName || ""
        }).then(r => {
            if (r.success) {
                console.log("Logged in successfully");
                location.href = "/";
                if (onError) onError();
            } else {
                console.log("Unsuccessful login !");
                if (onError) onError("Unsuccessful login!");
            }
        });
    } catch (err: any) {
        console.error('❌ Login error:', err);
        if (onError) {
            if (err && err.message && err.message.includes('not supported')) {
                onError('Google authentication is not supported on this device.');
            } else {
                onError('Login error: ' + (err?.message || 'Unknown error'));
            }
        }
    }
};

export const loginWithApple = async () => {
    try {
        const result = await FirebaseAuthentication.signInWithApple();
        console.log('🍎 Apple USER:', result.user);
    } catch (err) {
        console.error('❌ Apple login error:', err);
    }
};