import { storage } from '@/utils/storage';
import axios from 'axios';

const BASE_URL = 'https://api.quran.com/api/v4';

export interface Surah {
    id: number;
    revelation_place: string;
    revelation_order: number;
    bismillah_pre: boolean;
    name_simple: string;
    name_complex: string;
    name_arabic: string;
    verses_count: number;
    pages: number[];
    translated_name: {
        language_name: string;
        name: string;
    };
}

export interface Verse {
    id: number;
    verse_number: number;
    verse_key: string;
    juz_number: number;
    hizb_number: number;
    rub_el_hizb_number: number;
    text_uthmani: string;
    text_uthmani_simple?: string;
    text_imlaei?: string;
    translations?: Translation[];
    audio?: {
        url: string;
    };
}

export interface Translation {
    id: number;
    resource_id: number;
    text: string;
}

export interface ChaptersResponse {
    chapters: Surah[];
}

export interface VersesResponse {
    verses: Verse[];
    pagination: {
        per_page: number;
        current_page: number;
        next_page: number | null;
        total_pages: number;
        total_records: number;
    };
}

/**
 * Fetch all Surahs (Chapters)
 * Implements offline-first: checks MMKV cache first
 */
export const fetchSurahs = async (): Promise<Surah[]> => {
    try {
        // Check cache first
        const cached = await storage.getString('surahs');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }

        // Fetch from API
        const response = await axios.get<ChaptersResponse>(`${BASE_URL}/chapters`);
        const surahs = response.data.chapters;

        // Cache the result
        await storage.set('surahs', JSON.stringify(surahs));

        return surahs;
    } catch (error) {
        console.error('Error fetching surahs:', error);
        throw error;
    }
};

/**
 * Fetch verses for a specific Surah
 * @param surahId - The ID of the Surah
 * @param page - Page number for pagination (default: 1)
 */
export const fetchVerses = async (
    surahId: number,
    page: number = 1
): Promise<VersesResponse> => {
    try {
        const cacheKey = `verses_v4_${surahId}_${page}`;
        const cached = await storage.getString(cacheKey);

        if (cached) {
            return JSON.parse(cached);
        }

        const response = await axios.get<VersesResponse>(
            `${BASE_URL}/verses/by_chapter/${surahId}`,
            {
                params: {
                    language: 'en',
                    words: false,
                    translations: '20,131', // Saheeh International (20) and Dr. Mustafa Khattab (131)
                    page,
                    per_page: 50, // Increased page size to avoid "empty" feeling on pagination
                    fields: 'text_uthmani,text_uthmani_simple,text_imlaei', // Request multiple Arabic variants
                },
            }
        );

        const data = response.data;
        await storage.set(cacheKey, JSON.stringify(data));

        return data;
    } catch (error) {
        console.error('Error fetching verses:', error);
        throw error;
    }
};

/**
 * Fetch audio URL for a specific verse
 * @param verseKey - The verse key (e.g., "1:1")
 */
export const fetchVerseAudio = async (verseKey: string): Promise<string> => {
    try {
        const response = await axios.get(
            `${BASE_URL}/recitations/7/by_ayah/${verseKey}`
        );
        return response.data.audio_files[0]?.url || '';
    } catch (error) {
        console.error('Error fetching verse audio:', error);
        throw error;
    }
};

/**
 * Search for verses by keyword
 * @param query - Search query
 * @param language - Language code (default: 'en')
 */
export const searchVerses = async (
    query: string,
    language: string = 'en'
): Promise<any> => {
    try {
        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                q: query,
                size: 20,
                page: 1,
                language,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error searching verses:', error);
        throw error;
    }
};
