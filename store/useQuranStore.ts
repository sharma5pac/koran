import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface Surah {
    id: number;
    name_simple: string;
    name_arabic: string;
    name_complex: string;
    verses_count: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export interface LastRead {
    surahId: number;
    surahName: string;
    verseNumber: number;
    timestamp: number;
}

export interface HifzItem {
    verse_key: string;
    text_uthmani: string;
    surah_id: number;
    verse_number: number;
    dateAdded: number;
    status: 'memorizing' | 'memorized';
}

export interface QuranState {
    surahs: Surah[];
    bookmarks: any[];
    hifzItems: HifzItem[];
    lastRead: LastRead | null;
    fontSize: string;
    arabicFont: string;
    hasSeenIntro: boolean;

    notifications: boolean;
    adhanEnabled: boolean;
    prayerTimes: any | null;

    // Actions
    setSurahs: (surahs: Surah[]) => void;
    setBookmarks: (bookmarks: any[]) => void;
    setLastRead: (surahId: number, surahName: string, verseNumber: number) => void;
    addBookmark: (bookmark: any) => void;
    removeBookmark: (verseKey: string) => void;
    setHifzItems: (items: HifzItem[]) => void;
    toggleHifz: (verse: any) => void;
    setFontSize: (size: string) => void;
    setArabicFont: (font: string) => void;
    setNotifications: (enabled: boolean) => void;
    setAdhanEnabled: (enabled: boolean) => void;
    setPrayerTimes: (times: any) => void;
    setHasSeenIntro: (seen: boolean) => void;
    clearBookmarks: () => void;
    initialize: () => Promise<void>;
}

export const useQuranStore = create<QuranState>((set, get) => ({
    surahs: [],
    bookmarks: [],
    hifzItems: [],
    lastRead: null,
    fontSize: 'Medium',
    arabicFont: 'Amiri',
    hasSeenIntro: false,

    notifications: true,
    adhanEnabled: false,
    prayerTimes: null,

    setSurahs: (surahs) => set({ surahs }),
    setBookmarks: (bookmarks) => set({ bookmarks }),
    setLastRead: (surahId, surahName, verseNumber) => {
        const lastRead = { surahId, surahName, verseNumber, timestamp: Date.now() };
        set({ lastRead });
        persistSettings({ lastRead });
    },
    addBookmark: (bookmark) => set((state) => ({
        bookmarks: [...state.bookmarks, bookmark]
    })),
    removeBookmark: (verseKey) => set((state) => ({
        bookmarks: state.bookmarks.filter((b: any) => b.verse_key !== verseKey)
    })),
    setHifzItems: (hifzItems) => set({ hifzItems }),
    toggleHifz: (verse) => set((state) => {
        const exists = state.hifzItems.find((h: any) => h.verse_key === verse.verse_key);
        return {
            hifzItems: exists
                ? state.hifzItems.filter((h: any) => h.verse_key !== verse.verse_key)
                : [...state.hifzItems, { ...verse, dateAdded: Date.now(), status: 'memorizing' }]
        };
    }),

    setFontSize: (size) => {
        set({ fontSize: size });
        persistSettings({ fontSize: size });
    },
    setArabicFont: (font) => {
        set({ arabicFont: font });
        persistSettings({ arabicFont: font });
    },
    setNotifications: (notifications) => {
        set({ notifications });
        persistSettings({ notifications });
    },
    setAdhanEnabled: (adhanEnabled) => {
        set({ adhanEnabled });
        persistSettings({ adhanEnabled });
    },
    setPrayerTimes: (prayerTimes) => {
        set({ prayerTimes });
    },
    setHasSeenIntro: (hasSeenIntro) => {
        set({ hasSeenIntro });
        persistSettings({ hasSeenIntro });
    },
    clearBookmarks: () => set({ bookmarks: [] }),
    initialize: async () => {
        try {
            const saved = await AsyncStorage.getItem('@nurquran_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                set({
                    fontSize: settings.fontSize || 'Medium',
                    arabicFont: settings.arabicFont || 'Amiri',
                    notifications: settings.notifications ?? true,
                    hasSeenIntro: settings.hasSeenIntro ?? false,
                    lastRead: settings.lastRead || null,
                });
            }
        } catch (e) {
            console.error("Failed to initialize store", e);
        }
    },
}));

// Helper to persist settings
const persistSettings = async (update: Partial<QuranState>) => {
    try {
        const saved = await AsyncStorage.getItem('@nurquran_settings');
        const current = saved ? JSON.parse(saved) : {};
        await AsyncStorage.setItem('@nurquran_settings', JSON.stringify({ ...current, ...update }));
    } catch (e) {
        console.error("Failed to persist settings", e);
    }
};
