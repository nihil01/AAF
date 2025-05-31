import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { HttpClient } from "../net/HttpClient.ts";

export const loginWithGoogle = async () => {
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
            } else {
                console.log("Unsuccessful login !");
            }
        });


    } catch (err) {
        console.error('❌ Login error:', err);
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