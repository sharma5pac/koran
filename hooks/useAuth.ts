import { auth } from '@/services/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithCredential,
    User
} from 'firebase/auth';
import { useEffect, useState } from 'react';

// Required for web browser redirection
WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Google Auth Request
    // IMPORTANT: You must replace these placeholders with your actual Client IDs from Google Cloud Console
    // 1. Web Client ID (from Google Cloud -> Credentials)
    // 2. Android Client ID (from Google Cloud -> Credentials)
    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
        scopes: ['profile', 'email'],
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Handle Google Auth Response
    useEffect(() => {
        if (response?.type === 'success') {
            setError(null);

            // Debug: Log the full response to see what we're getting
            console.log("Google Auth Response:", JSON.stringify(response, null, 2));

            const { id_token, access_token } = response.params;
            const { idToken, accessToken } = response.authentication || {};

            const token = id_token || idToken;
            const finalAccessToken = accessToken || access_token;

            if (token) {
                const credential = GoogleAuthProvider.credential(token);
                setLoading(true);
                signInWithCredential(auth, credential)
                    .then(() => setLoading(false))
                    .catch((error: any) => {
                        console.error("Firebase Auth Error:", error);
                        setError(error);
                        setLoading(false);
                    });
            } else if (finalAccessToken) {
                // Fallback: If we only have an access token, try to use it
                // Note: Firebase usually prefers idToken for OIDC, but accessToken might work for some flows
                const credential = GoogleAuthProvider.credential(null, finalAccessToken);
                setLoading(true);
                signInWithCredential(auth, credential)
                    .then(() => setLoading(false))
                    .catch((error: any) => {
                        console.error("Firebase Auth Error (Access Token):", error);
                        setError(error);
                        setLoading(false);
                    });
            } else {
                const err = new Error("Google Auth Error: No id_token or accessToken found in response");
                setError(err);
            }
        } else if (response?.type === 'error') {
            setError(response.error || new Error("Google Sign-In Failed"));
        }
    }, [response]);

    const signInWithGoogle = async () => {
        try {
            setError(null);
            await promptAsync();
        } catch (error: any) {
            console.error("Google Sign-In Prompt Error:", error);
            setError(error);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            // After sign out, it will trigger onAuthStateChanged and sign in anonymously
        } catch (error: any) {
            console.error("Sign-Out Error:", error);
            setError(error);
        }
    };

    return { user, loading, error, signInWithGoogle, signOut };
}
