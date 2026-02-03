export const COLORS = {
    primary: '#1E5128',
    primaryDark: '#163A1F',
    primaryLight: '#4E9F3D',
    secondary: '#D8C292',
    accent: '#FFB800',

    background: {
        light: '#F8F9FA',
        dark: '#1A1A1A',
    },

    text: {
        primary: '#2C3E50',
        secondary: '#7F8C8D',
        light: '#BDC3C7',
        dark: '#FFFFFF',
    },

    border: {
        light: '#E0E0E0',
        dark: '#333333',
    },

    success: '#27AE60',
    error: '#E74C3C',
    warning: '#F39C12',
    info: '#3498DB',
};

export const FONTS = {
    arabic: 'Amiri',
    regular: 'System',
    medium: 'System',
    bold: 'System',
};

export const SIZES = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const API_ENDPOINTS = {
    BASE_URL: 'https://api.quran.com/api/v4',
    CHAPTERS: '/chapters',
    VERSES: '/verses/by_chapter',
    SEARCH: '/search',
    RECITATIONS: '/recitations',
};

export const STORAGE_KEYS = {
    SURAHS: 'surahs',
    BOOKMARKS: 'bookmarks',
    LAST_READ: 'last_read',
    SETTINGS: 'settings',
    USER_DATA: 'user_data',
};
