// Firebase configuration for NurQuran app

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAHf3g0txo7u7C_3vruZVesTwHpKeOBfDY",
    authDomain: "quran-5950a.firebaseapp.com",
    projectId: "quran-5950a",
    storageBucket: "quran-5950a.firebasestorage.app",
    messagingSenderId: "515231159561",
    appId: "1:515231159561:web:7bcacb1c0eeb2cf1b0efd8",
    measurementId: "G-JSZ520LR4L"
};

// Initialize Firebase - check if already initialized to avoid duplicate app error
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication
// Use React Native persistence for mobile platforms
let auth;

if (Platform.OS === 'web') {
    auth = getAuth(app);
} else {
    try {
        // Try to get existing auth instance first to avoid "already initialized" errors
        // This handles hot reloads where auth might already be set up
        auth = getAuth(app);
    } catch (e: any) {
        // If getAuth fails (usually "Component auth has not been registered yet"),
        // then we initialize it with persistence
        auth = initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage)
        });
    }
}

// Initialize Firestore
export const db = getFirestore(app);

export { auth };
export default app;
