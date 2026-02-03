import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage utility wrapper for AsyncStorage (Replacing MMKV for better Expo Go compatibility)
 */
export const storage = {
    getString: async (key: string): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(key);
        } catch (e) {
            console.error('Storage get error', e);
            return null;
        }
    },
    set: async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (e) {
            console.error('Storage set error', e);
        }
    },
    delete: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Storage delete error', e);
        }
    },
    clearAll: async () => {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            console.error('Storage clear error', e);
        }
    }
};

export const StorageService = {
    getString: storage.getString,
    setString: storage.set,
    setObject: async (key: string, value: any) => {
        await storage.set(key, JSON.stringify(value));
    },
    getObject: async (key: string) => {
        const value = await storage.getString(key);
        return value ? JSON.parse(value) : undefined;
    },
    delete: storage.delete,
    clearAll: storage.clearAll,
};
